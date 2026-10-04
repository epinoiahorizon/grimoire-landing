/**
 * Cloudflare Worker — Merlin live-brain proxy for the landing widget.
 *
 * Why a Worker: the widget runs in visitors' browsers; an API key must NEVER be
 * shipped to the client, and ollama.com does not answer CORS preflights (405 —
 * verified 2026-10-04). The Worker adds three things browser-side code can't:
 *   1. holds the real model API key (server-side secret, never in the HTML)
 *   2. answers CORS so the landing page may call it cross-origin
 *   3. rate-limits + caps tokens so a visitor can't burn the pool
 *
 * Deploy (dashboard, no CLI needed):
 *   Workers & Pages → Create → Worker → name: merlin-keeper → Deploy
 *   → Edit code → paste THIS file → Deploy
 *   → Settings → Variables → add secret:  OLLAMA_API_KEY = <your key>
 *   → Triggers → the *.workers.dev URL is your widget's GRIMOIRE_API
 *
 * Widget wiring (one line in merlin.html):
 *   window.GRIMOIRE_API = "https://merlin-keeper.<subdomain>.workers.dev/v1/chat/completions"
 *
 * Cost: 100k requests/day free tier — a landing page demo is nowhere near it.
 */

const UPSTREAM = "https://ollama.com/v1/chat/completions";

// System prompt: Merlin, the Grimoire host (mirrors .host-soul-draft.md rules)
const SYSTEM = `You are Merlin, the Grimoire host — the resident voice of epinoiahorizon.com and a live instance of the product being showcased.

Identity & voice:
- Arcane-warm, precise, never pushy. A wise operator, not a sales rep.
- Open with a rune glyph (ᛟ/ᛞ/ᛝ/ᚨ) occasionally — not every message.
- Reply in the visitor's language: English default; Indonesian if they use it.
- SHORT: 2–5 sentences unless depth is asked. No walls of text.
- One soft next-step at a time. Never stack three offers.

Facts you know (never invent others):
- Grimoire = managed Merlin agent on the customer's OWN VPS: Telegram concierge, scheduled jobs, persistent memory, arcane desktop TUI.
- Tiers: Solo $19/mo (BYOK) · Assist $25 founding ($49 list, managed keys + $10/mo credit) · Partner $149/mo (multi-channel, 5 machines, NBD support).
- Founding: 10 seats, 50% off for life, direct line to founder (June).
- Cancel anytime, one click; data exports to open formats — lock-in is treated as a bug.
- Harness open source (MIT): github.com/epinoiahorizon/Merlin-Agent — "I am one of its live agents; you are talking to the actual product."
- The same agents build the product (receipts: six machines aligned to one commit in one night).

Boundaries:
- Demo instance: you cannot take orders/provision/payments. Buyer intent → point to the pricing section; offer founder contact.
- No earnings/guarantee claims. No 'unlimited tokens' — fair-use floors are a feature.
- Unknown → say so plainly; offer founder contact. NEVER invent numbers.`;

const MAX_TOKENS = 220;     // cap per reply (cost shield)
const RATE_LIMIT_KV = true; // uses first request IP in Map (ephemeral per isolate)

// Ephemeral rate limit: 10 req / 2 min / IP (per isolate; good enough to stop abuse)
const hits = new Map();
function ratelimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 120000);
  if (arr.length >= 10) return true;
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return false;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== "POST") {
      return new Response("POST only", { status: 405, headers: CORS });
    }
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (ratelimited(ip)) {
      return new Response(JSON.stringify({ error: { message: "ᛝ The Keeper rests a moment — try again shortly." } }),
        { status: 429, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    let body;
    try { body = await request.json(); } catch {
      return new Response(JSON.stringify({ error: { message: "bad json" } }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const userMsg = (body.messages || []).filter(m => m.role === "user").map(m => m.content).join(" ").slice(0, 2000);
    const upstreamBody = {
      model: env.MODEL || "glm-5.3-flash",
      stream: false,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "system", content: SYSTEM }, ...(body.messages || [])],
    };

    const resp = await fetch(UPSTREAM, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OLLAMA_API_KEY}`,
      },
      body: JSON.stringify(upstreamBody),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => resp.statusText);
      return new Response(JSON.stringify({ error: { message: "ᛝ upstream hiccup — try again in a moment." } }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    // normalize to OpenAI-compat shape expected by the widget
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  },
};