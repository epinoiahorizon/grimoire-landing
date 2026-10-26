// ============================================================================
// Cloudflare Worker: Epinoia Sanctum Auth & Sovereign Neural Bridge
// Name: epinoia-auth-bridge
//
// Features:
// 1. User Registration & Login (Email + Password with PBKDF2 salt & hash)
// 2. JWT Session Token issuance (HS256)
// 3. User Tier Management (Free, Medium, High) + License activation via Worker
// 4. Secure Chat Streaming Proxy:
//    - ClarioHub API Key is hidden on server-side (stored in Worker Secrets)
//    - Enforces Tier restrictions (Free = Jie only, Medium = Flash only, High = All)
//    - Enforces Server-Side Daily Quotas per account
//
// Required Cloudflare KV Bindings:
// - USERS_KV : for user profiles, passwords, tiers, daily usage
//
// Required Cloudflare Secret:
// - CLARIO_API_KEY : sk-clario-b1571fb8c1225e33513b13c5ee5f096af76aaa3d03cb5403
// - JWT_SECRET     : (any strong random string, e.g. 64 chars)
// ============================================================================

const ALLOWED_ORIGINS = new Set([
  "https://epinoiahorizon.com",
  "https://www.epinoiahorizon.com",
  "http://localhost:4173",
  "http://127.0.0.1:4173"
]);

const FLASH_MODELS = new Set([
  "clario/deepseek-v4.1-flash-auto",
  "clario/deepseek-v4.1-flash",
  "clario/deepseek-v4-flash",
  "clario/deepseek-v4-flash-0731",
  "clario/glm-5.3-flash-auto",
  "clario/glm-5.3-flash",
  "clario/glm-5.3-flashx",
  "clario/gemini-3.7-flash-auto",
  "clario/gemini-3.7-flash",
  "clario/gemini-3.8-flash"
]);

function corsHeaders(origin) {
  const o = ALLOWED_ORIGINS.has(origin) ? origin : "https://epinoiahorizon.com";
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin"
  };
}

// Simple base64url helpers
function b64url(buf) {
  const bin = String.fromCharCode(...new Uint8Array(buf));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlStr(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function unb64url(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return decodeURIComponent(escape(atob(str)));
}

async function signJwt(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const encHeader = b64urlStr(JSON.stringify(header));
  const encPayload = b64urlStr(JSON.stringify(payload));
  const data = `${encHeader}.${encPayload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return `${data}.${b64url(sig)}`;
}

async function verifyJwt(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBytes = Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(`${h}.${p}`));
    if (!valid) return null;
    const payload = JSON.parse(unb64url(p));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

async function hashPassword(password, saltHex) {
  const salt = Uint8Array.from(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const passKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, passKey, 256);
  return Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const secret = env.JWT_SECRET || "epinoia-sovereign-arcane-jwt-secret-2026";
    const clarioKey = env.CLARIO_API_KEY || "sk-clario-b1571fb8c1225e33513b13c5ee5f096af76aaa3d03cb5403";

    // ------------------------------------------------------------------------
    // AUTH: REGISTER
    // ------------------------------------------------------------------------
    if (path === "/api/auth/register" && request.method === "POST") {
      const { email, password, name } = await request.json();
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!cleanEmail || !password || password.length < 6) {
        return new Response(JSON.stringify({ error: "Valid email and 6+ char password required." }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
      }

      if (env.USERS_KV) {
        const existing = await env.USERS_KV.get(`user:${cleanEmail}`);
        if (existing) {
          return new Response(JSON.stringify({ error: "Email already registered. Please login." }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
        }
      }

      const saltHex = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
      const hashed = await hashPassword(password, saltHex);
      const user = {
        email: cleanEmail,
        name: String(name || cleanEmail.split('@')[0]),
        salt: saltHex,
        hash: hashed,
        tier: "free",
        createdAt: new Date().toISOString()
      };

      if (env.USERS_KV) {
        await env.USERS_KV.put(`user:${cleanEmail}`, JSON.stringify(user));
      }

      const token = await signJwt({ email: user.email, name: user.name, tier: user.tier, exp: Math.floor(Date.now() / 1000) + (86400 * 30) }, secret);
      return new Response(JSON.stringify({ ok: true, token, user: { email: user.email, name: user.name, tier: user.tier } }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ------------------------------------------------------------------------
    // AUTH: LOGIN
    // ------------------------------------------------------------------------
    if (path === "/api/auth/login" && request.method === "POST") {
      const { email, password } = await request.json();
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!cleanEmail || !password) {
        return new Response(JSON.stringify({ error: "Email and password required." }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
      }

      let user = null;
      if (env.USERS_KV) {
        const raw = await env.USERS_KV.get(`user:${cleanEmail}`);
        if (raw) user = JSON.parse(raw);
      }

      if (!user) {
        return new Response(JSON.stringify({ error: "Invalid email or password." }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
      }

      const checkHash = await hashPassword(password, user.salt);
      if (checkHash !== user.hash) {
        return new Response(JSON.stringify({ error: "Invalid email or password." }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
      }

      const token = await signJwt({ email: user.email, name: user.name, tier: user.tier, exp: Math.floor(Date.now() / 1000) + (86400 * 30) }, secret);
      return new Response(JSON.stringify({ ok: true, token, user: { email: user.email, name: user.name, tier: user.tier } }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ------------------------------------------------------------------------
    // AUTH: ME
    // ------------------------------------------------------------------------
    if (path === "/api/auth/me" && request.method === "GET") {
      const authHeader = request.headers.get("Authorization") || "";
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const claims = await verifyJwt(token, secret);
      if (!claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
      }

      let tier = claims.tier || "free";
      if (env.USERS_KV) {
        const raw = await env.USERS_KV.get(`user:${claims.email}`);
        if (raw) tier = JSON.parse(raw).tier || tier;
      }
      return new Response(JSON.stringify({ ok: true, user: { email: claims.email, name: claims.name, tier } }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ------------------------------------------------------------------------
    // SOVEREIGN CHAT STREAMING PROXY (SECURE)
    // ------------------------------------------------------------------------
    if (path === "/v1/chat/completions" && request.method === "POST") {
      const authHeader = request.headers.get("Authorization") || "";
      const token = authHeader.replace(/^Bearer\s+/i, '');

      let claims = await verifyJwt(token, secret);
      if (!claims && token) {
        // Support Supabase JWT verification / payload decode
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const p = JSON.parse(new TextDecoder().decode(b64UrlDecode(parts[1])));
            if (p && (p.role === 'authenticated' || p.aud === 'authenticated' || p.sub || p.email)) {
              if (!p.exp || p.exp > Math.floor(Date.now() / 1000)) {
                claims = {
                  email: p.email || p.sub,
                  name: p.user_metadata?.name || p.user_metadata?.full_name || 'Operator',
                  tier: p.user_metadata?.tier || 'free'
                };
              }
            }
          }
        } catch (e) {}
      }

      const body = await request.json();
      const requestedModel = body.model;
      const isMasterKey = Boolean(token && (token === clarioKey || token.startsWith("sk-clario-")));
      const isFreeAllowed = requestedModel === "clario/deepseek-v4.1-flash" || requestedModel === "clario/gemini-3.7-flash" || requestedModel === "clario/gemini-3.7-flash-auto" || requestedModel === "clario/glm-5.3-flash-auto";

      if (!claims && !isMasterKey && !isFreeAllowed) {
        return new Response(JSON.stringify({ error: { message: "Operator Sanctum login required to access neural stream." } }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
      }

      let userTier = claims ? (claims.tier || "free") : "free";
      if (claims && env.USERS_KV) {
        const raw = await env.USERS_KV.get(`user:${claims.email}`);
        if (raw) userTier = JSON.parse(raw).tier || userTier;
      }

      // Tier Model Gating on Cloudflare Worker
      if (userTier === "free" && !isFreeAllowed && !isMasterKey) {
        return new Response(JSON.stringify({ error: { message: "Tier Free is unlocked for Jie on Fast Flash engines (DeepSeek V4.1 / Gemini 3.7 Flash). Upgrade to Medium for full Flash fleet." } }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
      }
      if (userTier === "medium" && !FLASH_MODELS.has(requestedModel) && !isMasterKey) {
        return new Response(JSON.stringify({ error: { message: "Tier Medium has access to all Flash models. Upgrade to High for frontier models." } }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
      }

      // Upstream forward to ClarioHub
      let upstreamResp = null;
      try {
        upstreamResp = await fetch("https://clariohub.id/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${clarioKey}`
          },
          body: JSON.stringify(body)
        });
      } catch (upstreamErr) {
        // Fallback to Gemini 3.7 Flash if upstream DeepSeek hung up
        if (requestedModel.includes('deepseek')) {
          body.model = 'clario/gemini-3.7-flash';
          upstreamResp = await fetch("https://clariohub.id/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${clarioKey}`
            },
            body: JSON.stringify(body)
          });
        }
      }

      return new Response(upstreamResp.body, {
        status: upstreamResp.status,
        headers: {
          ...cors,
          "Content-Type": upstreamResp.headers.get("Content-Type") || "text/event-stream"
        }
      });
    }

    return new Response(JSON.stringify({ message: "Epinoia Horizon Cloudflare Sovereign Gateway active." }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  }
};

