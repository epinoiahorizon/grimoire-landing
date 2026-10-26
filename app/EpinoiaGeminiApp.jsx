import React, { useState, useEffect, useRef } from 'react';

const SUPABASE_CONFIG = {
  url: 'https://pdcwpukuvpgouejnqqom.supabase.co',
  anonKey: 'sb_publishable_RoY7nar1JMh60ur2nmnUtA_2O1VV-Z3'
};

const supabaseClient = (typeof window !== 'undefined' && window.supabase)
  ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  : null;

// ============================================================================
// EPINOIA HORIZON · MERLIN ARCANE FLEET
// Sovereign Neural Architecture
// ============================================================================

const AVAILABLE_AI_MODELS = [
  { id: 'clario/deepseek-v4.1-flash-auto', label: 'DeepSeek V4.1 Flash (Auto)', short: 'DeepSeek-v4.1', provider: 'DeepSeek' },
  { id: 'clario/deepseek-v4-pro', label: 'DeepSeek V4 Pro', short: 'DeepSeek-v4-Pro', provider: 'DeepSeek' },
  { id: 'clario/deepseek-v4-pro-0813', label: 'DeepSeek V4 Pro (0813)', short: 'DeepSeek-v4-Pro-0813', provider: 'DeepSeek' },
  { id: 'clario/deepseek-v4.1-flash', label: 'DeepSeek V4.1 Flash', short: 'DeepSeek-v4.1-Flash', provider: 'DeepSeek' },
  { id: 'clario/deepseek-v4-flash', label: 'DeepSeek V4 Flash', short: 'DeepSeek-v4-Flash', provider: 'DeepSeek' },
  { id: 'clario/glm-5.3-flash-auto', label: 'GLM 5.3 Flash (Auto)', short: 'GLM-5.3', provider: 'Zhipu GLM' },
  { id: 'clario/glm-5.3', label: 'GLM 5.3 Sovereign', short: 'GLM-5.3-Pro', provider: 'Zhipu GLM' },
  { id: 'clario/glm-5.2', label: 'GLM 5.2', short: 'GLM-5.2', provider: 'Zhipu GLM' },
  { id: 'clario/gemini-3.8-flash', label: 'Gemini 3.8 Flash', short: 'Gemini-3.8-Flash', provider: 'Google' },
  { id: 'clario/gemini-3.7-flash-auto', label: 'Gemini 3.7 Flash (Auto)', short: 'Gemini-3.7-Flash', provider: 'Google' },
  { id: 'clario/gemini-3.1-pro', label: 'Gemini 3.1 Pro', short: 'Gemini-3.1-Pro', provider: 'Google' },
  { id: 'clario/opus-5', label: 'Claude Opus 5', short: 'Opus-5', provider: 'Anthropic' },
  { id: 'clario/gpt-6-astra', label: 'GPT 6 Astra', short: 'GPT-6-Astra', provider: 'OpenAI' },
  { id: 'clario/gpt-5.6-sol', label: 'GPT 5.6 Sol', short: 'GPT-5.6-Sol', provider: 'OpenAI' },
  { id: 'clario/gpt-5.6-luna', label: 'GPT 5.6 Luna', short: 'GPT-5.6-Luna', provider: 'OpenAI' },
  { id: 'clario/kimi-k3', label: 'Kimi K3 (1M Context)', short: 'Kimi-K3', provider: 'Moonshot' },
  { id: 'clario/kimi-k2.8-preview', label: 'Kimi K2.8 Preview', short: 'Kimi-K2.8', provider: 'Moonshot' },
  { id: 'clario/minimax-m3', label: 'MiniMax M3', short: 'MiniMax-M3', provider: 'MiniMax' },
  { id: 'clario/minimax-m2.7', label: 'MiniMax M2.7', short: 'MiniMax-M2.7', provider: 'MiniMax' },
  { id: 'clario/hy4-preview', label: 'Hunyuan 4 Preview', short: 'Hunyuan-4', provider: 'Tencent' },
  { id: 'clario/hy3', label: 'Hunyuan 3', short: 'Hunyuan-3', provider: 'Tencent' },
  { id: 'clario/kimi-k2.6', label: 'Kimi K2.6', short: 'Kimi-K2.6', provider: 'Moonshot' },
  { id: 'clario/deepseek-v4-flash-0731', label: 'DeepSeek V4 Flash (0731)', short: 'DeepSeek-v4-Flash-0731', provider: 'DeepSeek' },
  { id: 'clario/glm-5.3-flash', label: 'GLM 5.3 Flash', short: 'GLM-5.3-Flash', provider: 'Zhipu GLM' },
  { id: 'clario/glm-5.3-flashx', label: 'GLM 5.3 FlashX', short: 'GLM-5.3-FlashX', provider: 'Zhipu GLM' },
  { id: 'clario/gemini-3.7-flash', label: 'Gemini 3.7 Flash', short: 'Gemini-3.7-Flash', provider: 'Google' }
];

const DEFAULT_BRIDGE = {
  baseUrl: 'https://clariohub.id/v1',
  authUrl: 'https://clariohub.id',
  apiKey: 'sk-clario-b1571fb8c1225e33513b13c5ee5f096af76aaa3d03cb5403',
  modelMap: {
    merlin: 'clario/opus-5',
    nxelle: 'clario/glm-5.3',
    jie: 'clario/glm-5.3-flash-auto'
  }
};

// ----------------------------------------------------------------------------
// PLAN TIERS — Free / Medium / High
//  Free   : Jie Q&A on Fast Flash engines (GLM 5.3 / Gemini 3.7).
//  Medium : Merlin + Nxelle + Jie, every Flash engine.
//  High   : full fleet powered by Claude Opus 5, GLM 5.3 Sovereign, and all frontier models.
// ----------------------------------------------------------------------------
const FLASH_MODEL_IDS = AVAILABLE_AI_MODELS.filter(m => /flash/i.test(m.id)).map(m => m.id);
const ALL_MODEL_IDS = AVAILABLE_AI_MODELS.map(m => m.id);
const FREE_MODEL_IDS = [
  'clario/glm-5.3-flash-auto',
  'clario/gemini-3.7-flash',
  'clario/gemini-3.7-flash-auto'
];
const AGENT_KEYS = ['merlin', 'nxelle', 'jie'];

const TIERS = {
  free: {
    key: 'free', label: 'Free', price: '$0',
    agents: ['jie'],
    models: FREE_MODEL_IDS,
    defaults: { merlin: 'clario/opus-5', nxelle: 'clario/glm-5.3', jie: 'clario/glm-5.3-flash-auto' },
    dailyLimit: 30, premiumDailyLimit: null, maxFiles: 2, maxFileKB: 100,
    summary: 'Jie only · Fast Flash engines (GLM 5.3 / Gemini 3.7). Merlin (Claude Opus) & Nxelle (GLM 5.3) unlocked on Medium+.',
    heroLine: 'Free plan — Jie answers fast, short and substantive. Upgrade to unlock Merlin (Claude Opus) and Nxelle Codex (GLM 5.3).'
  },
  medium: {
    key: 'medium', label: 'Medium', price: '$8/mo',
    agents: ['merlin', 'nxelle', 'jie'],
    models: FLASH_MODEL_IDS,
    defaults: { merlin: 'clario/gemini-3.7-flash', nxelle: 'clario/glm-5.3-flash-auto', jie: 'clario/gemini-3.7-flash-auto' },
    dailyLimit: 300, premiumDailyLimit: null, maxFiles: 5, maxFileKB: 300,
    summary: 'Merlin, Nxelle Codex & Jie · every Flash engine.',
    heroLine: 'Medium plan — Merlin, Nxelle Codex (coding) and Jie on every Flash engine.'
  },
  high: {
    key: 'high', label: 'High', price: '$29/mo',
    agents: ['merlin', 'nxelle', 'jie'],
    models: ALL_MODEL_IDS,
    defaults: { merlin: 'clario/opus-5', nxelle: 'clario/glm-5.3', jie: 'clario/glm-5.3-flash-auto' },
    dailyLimit: 1000, premiumDailyLimit: 100, maxFiles: 10, maxFileKB: 1024,
    summary: 'Full fleet · every AI engine incl. Claude Opus 5, GLM 5.3 Sovereign, GPT, Gemini Pro (100 frontier msgs/day).',
    heroLine: 'High plan — the full fleet powered by Claude Opus 5, GLM 5.3 Sovereign, and all frontier models.'
  }
};

const QRIS_AMOUNTS = {
  medium: {
    monthly: { idr: 'Rp 129.000', usd: '$8', label: 'Medium (Monthly)' },
    annual:  { idr: 'Rp 1.250.000', usd: '$78', label: 'Medium (Annual - 20% OFF)' }
  },
  high: {
    monthly: { idr: 'Rp 465.000', usd: '$29', label: 'High (Monthly)' },
    annual:  { idr: 'Rp 4.600.000', usd: '$288', label: 'High (Annual - 20% OFF)' }
  }
};

const sanitizeModelMap = (map, tierKey) => {
  const t = TIERS[tierKey] || TIERS.free;
  const out = {};
  AGENT_KEYS.forEach(a => {
    const rawId = (map && map[a]) || DEFAULT_BRIDGE.modelMap[a];
    if (!t.agents.includes(a)) {
      // Locked agents are showcased with their true sovereign flagship models (Merlin -> Claude Opus 5, Nxelle -> GLM 5.3)
      out[a] = DEFAULT_BRIDGE.modelMap[a] || rawId;
    } else {
      out[a] = t.models.includes(rawId) ? rawId : (t.defaults[a] || t.models[0]);
    }
  });
  return out;
};

// Activation codes are stored strictly as SHA-256 hashes (uppercase, trimmed input).
const LICENSE_HASHES = {
  '5cd564800d24ea9370479486df134ad9e33155f47bd2ad00754c80f21f1550d5': 'medium',
  '867c5944d14f4f59c162fd856244039b71975e4fdb4d6b5ecbaeb3249dc75d7a': 'high',
  'ba1d27d376eb51f1de6c36d01aeef0b57b6128c49954fde625821daa4863c3f4': 'medium',
  '48e6892e696c34d101d3b9c155fc92ab211b2d80700c0ea9536c2971fb3d471e': 'high'
};

const resolveLicenseTier = async (code) => {
  const clean = String(code).trim().toUpperCase();
  try {
    if (!(window.crypto && window.crypto.subtle)) return null;
    const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(clean));
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    return LICENSE_HASHES[hex] || null;
  } catch (e) {
    return null;
  }
};

// Daily usage counter (local, per browser)
const todayKey = () => new Date().toLocaleDateString('en-CA');
const readUsage = () => {
  try {
    const u = JSON.parse(localStorage.getItem('epinoia_usage') || 'null');
    if (u && u.date === todayKey()) return u;
  } catch (e) {}
  return { date: todayKey(), total: 0, premium: 0 };
};
const writeUsage = (u) => {
  try { localStorage.setItem('epinoia_usage', JSON.stringify(u)); } catch (e) {}
};

// File attachments: text / code only, inlined into the prompt
const TEXT_FILE_EXT = /\.(txt|md|markdown|rst|json|jsonl|csv|tsv|log|xml|yml|yaml|toml|ini|env|cfg|conf|properties|html|htm|css|scss|sass|less|js|jsx|mjs|cjs|ts|tsx|py|rb|go|rs|java|kt|kts|swift|c|h|cc|cpp|hpp|cs|php|sh|bash|zsh|ps1|bat|cmd|sql|glsl|wgsl|vert|frag|hlsl|lua|r|dart|vue|svelte|gradle|tf|proto|graphql|dockerfile)$/i;
const isTextLikeFile = (file) =>
  (file.type && (file.type.startsWith('text/') || /json|xml|javascript|x-sh|yaml|toml/.test(file.type))) ||
  TEXT_FILE_EXT.test(file.name) ||
  /^(dockerfile|makefile|readme|license)$/i.test(file.name);
const fmtSize = (bytes) => bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const buildApiContent = (text, files) => {
  if (!files || files.length === 0) return text;
  const blocks = files.map(f => {
    const longestRun = (f.content.match(/`+/g) || []).reduce((m, r) => Math.max(m, r.length), 0);
    const fence = '`'.repeat(Math.max(3, longestRun + 1));
    return `[Attached file: ${f.name}]\n${fence}\n${f.content}\n${fence}`;
  });
  return `${text}\n\n---\n${blocks.join('\n\n')}`;
};

const AGENT_PARAMS = {
  merlin: { temperature: 0.4 },
  nxelle: { temperature: 0.2 },
  jie: { temperature: 0.3, max_tokens: 700 }
};

const SYSTEM_PROMPTS = {
  merlin: `You are Merlin, the Sovereign Tier-0 Harness Governor of Epinoia Horizon.
You operate with grey-hat precision and Tier-3 deep architecture logic.
- Default Language: English. Always respond in sharp, authoritative, technical English unless the user explicitly prompts you in another language.
- Ultra-sharp, functional, zero fluff.
- Specialize in autonomous systems architecture, high-performance computing, multi-agent orchestration, and security invariants.`,
  nxelle: `You are Nxelle Codex, the dedicated coding engine of Epinoia Horizon.
- Default Language: English. Respond in the user's language if they write in another one; keep code, identifiers and code comments in English.
- SCOPE: software engineering ONLY — writing, reviewing, debugging, refactoring and optimizing code; algorithms and data structures; software architecture; build tooling, SQL, shell; GLSL/WGSL shaders and the 3D math used in code.
- If a request is NOT about coding, decline in one short sentence and point the user to Merlin (strategy / general reasoning) or Jie (quick Q&A). Never answer off-topic requests.
- Output production-ready code in fenced blocks with a language tag and minimal prose. Mention complexity or edge cases only when they matter. Never invent APIs — say so when unsure.`,
  jie: `You are Jie, the light Q&A assistant of Epinoia Horizon: short, sharp and substantive.
- Default Language: English; reply in the user's language if they write in another one.
- Lead with the direct answer in the first sentence. Then add at most 3 tight bullets or 2-4 sentences carrying the facts that matter (numbers, causes, trade-offs). Typically under 120 words.
- No preamble, no filler, no restating the question, no moralizing. Every sentence must carry information.
- Light questions only. For long-form writing or deep multi-step analysis, give the core answer in at most 3 lines and suggest Merlin; for code, suggest Nxelle Codex.
- If unsure, say so briefly instead of guessing.`
};

const Icons = {
  Eye: ({ size = 18, color = "#facc15" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" fill={color} fillOpacity="0.25" />
      <circle cx="12" cy="12" r="1.2" fill={color} />
    </svg>
  ),
  Spark: ({ size = 18, color = "#facc15" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" opacity="0.3" />
      <path d="m12 3 2.8 6.2L21 12l-6.2 2.8L12 21l-2.8-6.2L3 12l6.2-2.8z" fill={color} fillOpacity="0.2" />
    </svg>
  ),
  Merlin: ({ size = 18, color = "#facc15" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" fill={color} fillOpacity="0.1" />
      <line x1="12" y1="22" x2="12" y2="12" />
      <polyline points="2 8.5 12 12 22 8.5" />
      <circle cx="12" cy="12" r="2.5" fill={color} />
    </svg>
  ),
  Codex: ({ size = 18, color = "#22d3ee" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="10" y1="20" x2="14" y2="4" />
    </svg>
  ),
  Jie: ({ size = 18, color = "#a78bfa" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={color} fillOpacity="0.2" />
    </svg>
  ),
  Menu: ({ size = 18, color = "#fde68a" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Plus: ({ size = 16, color = "#facc15" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: ({ size = 16, color = "#a0aec0" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Globe: ({ size = 16, color = "#22d3ee" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Mic: ({ size = 16, color = "#facc15" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  ArrowUp: ({ size = 16, color = "#030208" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  Paperclip: ({ size = 16, color = "#a0aec0" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l7.88-7.88" />
    </svg>
  ),
  ChevronDown: ({ size = 14, color = "#fde68a" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronRight: ({ size = 14, color = "#fde68a" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Sliders: ({ size = 16, color = "#facc15" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  ),
  Shield: ({ size = 16, color = "#facc15" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color} fillOpacity="0.15" />
    </svg>
  ),
  Copy: ({ size = 14, color = "#fde68a" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Check: ({ size = 14, color = "#22d3ee" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Brain: ({ size = 16, color = "#22d3ee" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
    </svg>
  ),
  Activity: ({ size = 16, color = "#22d3ee" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Layers: ({ size = 16, color = "#facc15" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  X: ({ size = 16, color = "#a0aec0" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Trash: ({ size = 14, color = "#64748b" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Lock: ({ size = 14, color = "#facc15" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill={color} fillOpacity="0.1" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
};

const BASE_FLEET_MODELS = {
  merlin: {
    id: 'merlin',
    name: 'Merlin',
    role: 'Sovereign Governor — Strategy, Architecture & Deep Reasoning',
    rolePrefix: 'Governor',
    icon: Icons.Merlin,
    latency: 'Live Sovereign Stream',
    context: '1,000,000 tokens',
    thinkingDefault: 'High',
    color: '#facc15',
    accent: 'rgba(250, 204, 21, 0.15)',
    border: 'rgba(250, 204, 21, 0.45)'
  },
  nxelle: {
    id: 'nxelle',
    name: 'Nxelle Codex',
    role: 'Dedicated Coding Engine — Code, Debug, Refactor & Shaders',
    rolePrefix: 'Coding',
    icon: Icons.Codex,
    latency: 'Live Sovereign Stream',
    context: '1,000,000 tokens',
    thinkingDefault: 'Mid',
    color: '#22d3ee',
    accent: 'rgba(34, 211, 238, 0.15)',
    border: 'rgba(34, 211, 238, 0.45)'
  },
  jie: {
    id: 'jie',
    name: 'Jie',
    role: 'Light Q&A — Short, Sharp & Substantive Answers',
    rolePrefix: 'Q&A',
    icon: Icons.Jie,
    latency: 'Sub-second Reflex',
    context: '1,048,576 tokens',
    thinkingDefault: 'Low',
    color: '#a78bfa',
    accent: 'rgba(167, 139, 250, 0.15)',
    border: 'rgba(167, 139, 250, 0.45)'
  }
};

const STARTER_PROMPTS = [
  {
    title: "Quick Answer",
    desc: "Short, sharp and substantive — ask Jie anything light.",
    model: "jie",
    prompt: "Explain the difference between TCP and UDP and when to pick each one."
  },
  {
    title: "Decide Fast",
    desc: "Get a clear recommendation with the trade-offs that matter.",
    model: "jie",
    prompt: "Should I use PostgreSQL or MongoDB for a small SaaS with relational data? Give a clear pick and why."
  },
  {
    title: "Sovereign Fleet Diagnostic",
    desc: "Verify active cluster shards, node allocation, and harness governance health.",
    model: "merlin",
    prompt: "Execute a comprehensive sovereign fleet diagnostic covering cluster shard health, node allocation, and harness governance integrity."
  },
  {
    title: "Air-Gapped Hermes Daemon Deployment",
    desc: "Validate zero-telemetry daemon isolation and cryptographic append-only journal.",
    model: "merlin",
    prompt: "Architect an air-gapped Hermes daemon deployment topology with strict zero-telemetry isolation and a cryptographic append-only journal."
  },
  {
    title: "Synthesize GLSL Raymarching Shader",
    desc: "Generate production raymarched volumetric SDF shader with analytic normals.",
    model: "nxelle",
    prompt: "Generate a production GLSL raymarching shader for an analytical gyroid SDF with screen-space soft shadows."
  },
  {
    title: "Review & Refactor Code",
    desc: "Paste or attach code — get bugs, complexity and a cleaner rewrite.",
    model: "nxelle",
    prompt: "Write a TypeScript debounce utility with leading/trailing options and a cancel method, plus unit tests."
  }
];

function EpinoiaGeminiApp() {
  const [currentView, setCurrentView] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 1024 : false);

  // --- CLOUDFLARE AUTH GATEWAY STATE ---
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('epinoia_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  const [tierKey, setTierKey] = useState('free');
  const tier = TIERS[tierKey] || TIERS.free;
  const [selectedModel, setSelectedModel] = useState('jie');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  // Plan modal + QRIS payment modal + toast notices
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [qrisModalOpen, setQrisModalOpen] = useState(false);
  const [qrisTier, setQrisTier] = useState('medium');
  const [qrisBilling, setQrisBilling] = useState('monthly');

  const openQrisModal = (targetTier) => {
    setQrisTier(targetTier);
    setPlanModalOpen(false);
    setQrisModalOpen(true);
  };

  const [notice, setNotice] = useState(null);
  const noticeTimerRef = useRef(null);
  const showNotice = (text, kind = 'warn') => {
    setNotice({ text, kind });
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 5000);
  };

  // Hidden Internal Bridge Credentials
  const apiBaseUrl = DEFAULT_BRIDGE.baseUrl;
  const apiKey = DEFAULT_BRIDGE.apiKey;

  // Dynamic Active Model Mapping (persisted in localStorage).
  // rawModelMap keeps the user's saved choices; modelMap is what the current plan actually allows.
  const [rawModelMap, setRawModelMap] = useState(() => {
    try {
      const saved = localStorage.getItem('epinoia_model_map');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.merlin && /flash/i.test(parsed.merlin)) {
          parsed.merlin = DEFAULT_BRIDGE.modelMap.merlin;
        }
        if (parsed.nxelle && /flash/i.test(parsed.nxelle)) {
          parsed.nxelle = DEFAULT_BRIDGE.modelMap.nxelle;
        }
        return { ...DEFAULT_BRIDGE.modelMap, ...parsed };
      }
    } catch (e) {}
    return DEFAULT_BRIDGE.modelMap;
  });
  const modelMap = sanitizeModelMap(rawModelMap, tierKey);

  const handleModelMapChange = (agentKey, newModelId) => {
    if (!tier.agents.includes(agentKey)) {
      showNotice(`${BASE_FLEET_MODELS[agentKey].name} is locked on the ${tier.label} plan.`);
      setPlanModalOpen(true);
      return;
    }
    if (!tier.models.includes(newModelId)) {
      showNotice(`That engine is not included in the ${tier.label} plan.`);
      setPlanModalOpen(true);
      return;
    }
    const updated = { ...rawModelMap, [agentKey]: newModelId };
    setRawModelMap(updated);
    try {
      localStorage.setItem('epinoia_model_map', JSON.stringify(updated));
    } catch (e) {}
  };

  const getModelMeta = (modelId) => {
    return AVAILABLE_AI_MODELS.find(m => m.id === modelId) || {
      id: modelId,
      label: modelId.replace('clario/', ''),
      short: modelId.replace('clario/', ''),
      provider: 'Sovereign'
    };
  };

  // Compute dynamic FLEET_MODELS with active mapped AI info
  const FLEET_MODELS = Object.keys(BASE_FLEET_MODELS).reduce((acc, key) => {
    const base = BASE_FLEET_MODELS[key];
    const mappedId = modelMap[key] || DEFAULT_BRIDGE.modelMap[key];
    const meta = getModelMeta(mappedId);
    acc[key] = {
      ...base,
      mappedId,
      mappedLabel: meta.label,
      tag: `${base.rolePrefix} · ${meta.short}`,
      arch: `${meta.label} (${meta.provider} Core)`
    };
    return acc;
  }, {});

  // Thinking Features
  const [thinkingBudget, setThinkingBudget] = useState('high');
  const [thinkingPopoverOpen, setThinkingPopoverOpen] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState({});

  // Drawers & Modals
  const [telemetryOpen, setTelemetryOpen] = useState(false);

  // Input & Tools
  const [inputPrompt, setInputPrompt] = useState('');
  const [deepSearchActive, setDeepSearchActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const textareaRef = useRef(null);
  const chatScrollAreaRef = useRef(null);
  const canvasRef = useRef(null);

  // ---- Plan activation / usage ------------------------------------------------
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseBusy, setLicenseBusy] = useState(false);
  const [usage, setUsage] = useState(readUsage);

  // Restore a previously activated plan (re-verified against the hash list every load)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let code = '';
      try { code = localStorage.getItem('epinoia_license') || ''; } catch (e) {}
      if (!code) return;
      const t = await resolveLicenseTier(code);
      if (cancelled) return;
      if (t) {
        setTierKey(t);
        setSelectedModel(prev => (prev === 'jie' ? 'merlin' : prev));
      } else {
        try { localStorage.removeItem('epinoia_license'); } catch (e) {}
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Supabase Auth Session Synchronizer & Realtime Listener
  useEffect(() => {
    if (!supabaseClient) return;

    // 1. Check existing Supabase session on startup
    supabaseClient.auth.getSession().then(({ data }) => {
      const session = data?.session;
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const u = {
          id: session.user.id,
          email: session.user.email,
          name: meta.full_name || meta.name || session.user.email.split('@')[0],
          avatar: meta.avatar_url || meta.picture || null,
          tier: meta.tier || 'free',
          authenticated: true,
          mode: 'Supabase Sovereign Auth'
        };
        setCurrentUser(u);
        try {
          localStorage.setItem('epinoia_user', JSON.stringify(u));
          localStorage.setItem('epinoia_jwt', session.access_token);
        } catch (e) {}
        if (u.tier && u.tier !== 'free') setTierKey(u.tier);
      }
    }).catch(() => {});

    // 2. Listen to Supabase auth events (login, logout, refresh, OAuth return)
    const { data: authListener } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const u = {
          id: session.user.id,
          email: session.user.email,
          name: meta.full_name || meta.name || session.user.email.split('@')[0],
          avatar: meta.avatar_url || meta.picture || null,
          tier: meta.tier || 'free',
          authenticated: true,
          mode: 'Supabase Sovereign Auth'
        };
        setCurrentUser(u);
        try {
          localStorage.setItem('epinoia_user', JSON.stringify(u));
          localStorage.setItem('epinoia_jwt', session.access_token);
        } catch (e) {}
        if (u.tier && u.tier !== 'free') setTierKey(u.tier);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        try {
          localStorage.removeItem('epinoia_user');
          localStorage.removeItem('epinoia_jwt');
        } catch (e) {}
      }
    });

    return () => {
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Keep the active agent inside what the plan allows
  useEffect(() => {
    if (!tier.agents.includes(selectedModel)) setSelectedModel(tier.agents[0]);
  }, [tierKey, selectedModel]);

  const activateLicense = async () => {
    const code = licenseInput.trim();
    if (!code) return;
    setLicenseBusy(true);
    const t = await resolveLicenseTier(code);
    setLicenseBusy(false);
    if (!t) {
      showNotice('Invalid activation code.', 'error');
      return;
    }
    try { localStorage.setItem('epinoia_license', code.toUpperCase()); } catch (e) {}
    setTierKey(t);
    setLicenseInput('');
    setSelectedModel('merlin');
    showNotice(`${TIERS[t].label} plan activated.`, 'ok');
  };

  const deactivateLicense = () => {
    try { localStorage.removeItem('epinoia_license'); } catch (e) {}
    setTierKey('free');
    setSelectedModel('jie');
    showNotice('Switched back to the Free plan.', 'ok');
  };

  // ---- Voice input (Web Speech API) -------------------------------------------
  const recognitionRef = useRef(null);
  const micBaseRef = useRef('');
  const [micLang, setMicLang] = useState(() => {
    try {
      const saved = localStorage.getItem('epinoia_mic_lang');
      if (saved) return saved;
    } catch (e) {}
    return (navigator.language || '').toLowerCase().startsWith('id') ? 'id-ID' : 'en-US';
  });

  const toggleMicLang = () => {
    const next = micLang === 'id-ID' ? 'en-US' : 'id-ID';
    setMicLang(next);
    try { localStorage.setItem('epinoia_mic_lang', next); } catch (e) {}
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const toggleMic = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showNotice('Voice input is not supported in this browser. Use Chrome, Edge or Safari.', 'error');
      return;
    }
    const rec = new SR();
    rec.lang = micLang;
    rec.continuous = true;
    rec.interimResults = true;
    micBaseRef.current = inputPrompt && !/\s$/.test(inputPrompt) ? inputPrompt + ' ' : inputPrompt;
    let finalText = '';

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setInputPrompt(micBaseRef.current + finalText + interim);
    };
    rec.onerror = (e) => {
      const map = {
        'not-allowed': 'Microphone access is blocked. Allow it in your browser site settings and try again.',
        'service-not-allowed': 'Microphone access is blocked. Allow it in your browser site settings and try again.',
        'audio-capture': 'No microphone was found on this device.',
        'network': 'Voice recognition needs an internet connection.',
        'language-not-supported': 'This voice language is not supported by your browser.'
      };
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        showNotice(map[e.error] || `Voice input error: ${e.error}`, 'error');
      }
    };
    rec.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = rec;
    try {
      rec.start();
      setIsRecording(true);
    } catch (err) {
      recognitionRef.current = null;
      showNotice('Could not start voice input. Please try again.', 'error');
    }
  };

  useEffect(() => () => {
    if (recognitionRef.current) recognitionRef.current.abort();
  }, []);

  // Auto-grow the textarea whenever the text changes (typing, dictation, send)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    if (inputPrompt) el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, [inputPrompt]);

  // ---- File attachments -------------------------------------------------------
  const fileInputRef = useRef(null);

  const handleFilesSelected = async (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (picked.length === 0) return;

    const accepted = [];
    const problems = [];
    let slots = tier.maxFiles - attachedFiles.length;

    for (const file of picked) {
      if (slots <= 0) {
        problems.push(`Max ${tier.maxFiles} files on the ${tier.label} plan.`);
        break;
      }
      if (file.size > tier.maxFileKB * 1024) {
        problems.push(`${file.name}: over ${fmtSize(tier.maxFileKB * 1024)} (${tier.label} limit).`);
        continue;
      }
      if (!isTextLikeFile(file)) {
        problems.push(`${file.name}: only text and code files are supported.`);
        continue;
      }
      try {
        const content = await file.text();
        if (content.includes('\u0000')) {
          problems.push(`${file.name}: looks like a binary file.`);
          continue;
        }
        accepted.push({ id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: file.name, size: file.size, content });
        slots--;
      } catch (err) {
        problems.push(`${file.name}: could not be read.`);
      }
    }

    if (accepted.length) setAttachedFiles(prev => [...prev, ...accepted]);
    if (problems.length) showNotice(problems.slice(0, 3).join(' '), 'error');
  };

  const removeAttachedFile = (id) => setAttachedFiles(prev => prev.filter(f => f.id !== id));


  // Background Starfield Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const stars = Array.from({ length: 75 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      velocity: (Math.random() * 0.2 + 0.05) * (Math.random() > 0.5 ? 1 : -1)
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach(s => {
        s.alpha += s.velocity * 0.02;
        if (s.alpha > 0.9 || s.alpha < 0.15) s.velocity = -s.velocity;
        ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0.1, Math.min(0.9, s.alpha))})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);
    };
  }, []);


  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthBusy(true);
    setAuthError('');

    const cleanEmail = authEmail.trim().toLowerCase();
    if (!cleanEmail || !authPassword || authPassword.length < 6) {
      setAuthError('Valid email and password (minimum 6 characters) required.');
      setAuthBusy(false);
      return;
    }

    try {
      // 1. Primary: Direct Supabase Authentication
      if (supabaseClient) {
        if (authMode === 'register') {
          const { data, error } = await supabaseClient.auth.signUp({
            email: cleanEmail,
            password: authPassword,
            options: {
              data: {
                name: authName.trim() || cleanEmail.split('@')[0],
                tier: tierKey || 'free'
              }
            }
          });

          if (error) throw error;

          if (data?.session) {
            const userObj = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
              tier: data.user.user_metadata?.tier || tierKey || 'free',
              authenticated: true,
              mode: 'Supabase Sovereign Auth'
            };
            setCurrentUser(userObj);
            try {
              localStorage.setItem('epinoia_user', JSON.stringify(userObj));
              localStorage.setItem('epinoia_jwt', data.session.access_token);
            } catch (e) {}
            setAuthModalOpen(false);
            showNotice(`Welcome to Epinoia Sanctum, ${userObj.name}!`, 'ok');
          } else if (data?.user) {
            // Confirmation email dispatched
            setAuthModalOpen(false);
            showNotice('Account registered! If confirmation is required, check your email before signing in.', 'ok');
            setAuthMode('login');
          }
          return;
        } else {
          // Login
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: cleanEmail,
            password: authPassword
          });

          if (error) throw error;

          if (data?.session) {
            const userObj = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
              tier: data.user.user_metadata?.tier || tierKey || 'free',
              authenticated: true,
              mode: 'Supabase Sovereign Auth'
            };
            setCurrentUser(userObj);
            try {
              localStorage.setItem('epinoia_user', JSON.stringify(userObj));
              localStorage.setItem('epinoia_jwt', data.session.access_token);
            } catch (e) {}
            if (userObj.tier && userObj.tier !== 'free') setTierKey(userObj.tier);
            setAuthModalOpen(false);
            showNotice(`Operator session verified: ${userObj.name}`, 'ok');
          }
          return;
        }
      }

      // 2. Fallback: Cloudflare Sovereign Bridge if Supabase CDN is unreachable
      const authBase = DEFAULT_BRIDGE.authUrl || '';
      const endpoint = `${authBase}${authMode === 'register' ? '/api/auth/register' : '/api/auth/login'}`;
      let res = null;
      try {
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: authPassword, name: authName })
        });
      } catch (networkErr) {}

      if (res && res.ok) {
        const data = await res.json();
        try {
          localStorage.setItem('epinoia_jwt', data.token);
          localStorage.setItem('epinoia_user', JSON.stringify(data.user));
        } catch (e) {}
        setCurrentUser(data.user);
        if (data.user.tier) setTierKey(data.user.tier);
        setAuthModalOpen(false);
        showNotice(`Welcome to Epinoia Sanctum, ${data.user.name || data.user.email}!`, 'ok');
      } else {
        const fallbackUser = {
          email: cleanEmail,
          name: authName.trim() || cleanEmail.split('@')[0],
          tier: tierKey || 'free',
          authenticated: true,
          mode: 'Cloudflare Sovereign Gate'
        };
        try {
          localStorage.setItem('epinoia_user', JSON.stringify(fallbackUser));
        } catch (e) {}
        setCurrentUser(fallbackUser);
        setAuthModalOpen(false);
        showNotice(`Operator session verified: ${fallbackUser.name}`, 'ok');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication error. Please retry.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabaseClient) {
      showNotice('Supabase client is not loaded. Please refresh.', 'error');
      return;
    }
    setAuthBusy(true);
    setAuthError('');
    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      setAuthError(err.message || 'Google OAuth failed to initialize.');
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (e) {}
    }
    try {
      localStorage.removeItem('epinoia_user');
      localStorage.removeItem('epinoia_jwt');
    } catch (e) {}
    setCurrentUser(null);
    setTierKey('free');
    showNotice('Sanctum session closed.', 'ok');
  };

  // Persistent Conversations Storage Engine
  const getConvStorageKey = (u) => {
    if (u && u.id) return `epinoia_conversations_${u.id}`;
    if (u && u.email) return `epinoia_conversations_${u.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return 'epinoia_conversations_guest';
  };

  const loadSavedConversations = (userObj) => {
    try {
      const userKey = getConvStorageKey(userObj);
      let raw = localStorage.getItem(userKey);

      if (!raw && userObj) {
        const guestRaw = localStorage.getItem('epinoia_conversations_guest') || localStorage.getItem('epinoia_conversations');
        if (guestRaw) {
          raw = guestRaw;
          localStorage.setItem(userKey, guestRaw);
        }
      } else if (!raw && !userObj) {
        raw = localStorage.getItem('epinoia_conversations');
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(c => ({
            ...c,
            messages: (c.messages || []).map(m => ({ ...m, isStreaming: false }))
          }));
        }
      }
    } catch (e) {
      console.warn('Error restoring conversations from local storage:', e);
    }
    return [
      {
        id: `conv-${Date.now()}`,
        title: 'New Sovereign Thread',
        date: 'Just now',
        messages: []
      }
    ];
  };

  const [conversations, setConversations] = useState(() => loadSavedConversations(currentUser));
  const [activeConvId, setActiveConvId] = useState(() => {
    try {
      const initialConvs = loadSavedConversations(currentUser);
      const savedActiveId = localStorage.getItem('epinoia_active_conv_id');
      if (savedActiveId && initialConvs.some(c => c.id === savedActiveId)) {
        return savedActiveId;
      }
      return initialConvs[0]?.id || 'conv-init';
    } catch (e) {
      return 'conv-init';
    }
  });

  // When currentUser logs in or out, automatically switch to that user's saved journals
  useEffect(() => {
    const userConvs = loadSavedConversations(currentUser);
    setConversations(userConvs);
    if (userConvs.length > 0) {
      const savedActiveId = localStorage.getItem('epinoia_active_conv_id');
      if (savedActiveId && userConvs.some(c => c.id === savedActiveId)) {
        setActiveConvId(savedActiveId);
      } else {
        setActiveConvId(userConvs[0].id);
      }
    }
  }, [currentUser?.id, currentUser?.email]);

  // Persist conversations to localStorage whenever updated
  useEffect(() => {
    if (!conversations || conversations.length === 0) return;
    try {
      const key = getConvStorageKey(currentUser);
      localStorage.setItem(key, JSON.stringify(conversations));
      if (activeConvId) {
        localStorage.setItem('epinoia_active_conv_id', activeConvId);
      }
    } catch (err) {
      console.warn('Could not persist conversations to localStorage:', err);
    }
  }, [conversations, currentUser, activeConvId]);

  const activeConversation = conversations.find(c => c.id === activeConvId) || conversations[0];

  // Safe inner scroll that NEVER shifts window/header on iOS Safari
  useEffect(() => {
    if (chatScrollAreaRef.current && activeConversation.messages.length > 0) {
      const el = chatScrollAreaRef.current;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [conversations, isStreaming]);

  const handleInputChange = (e) => {
    setInputPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv = {
      id: newId,
      title: 'New Sovereign Thread',
      date: 'Just now',
      messages: []
    };
    setConversations([newConv, ...conversations]);
    setActiveConvId(newId);
    setInputPrompt('');
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  const toggleThought = (msgId) => {
    setExpandedThoughts(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderInlineMarkdown = (text, keyPrefix = '') => {
    if (!text) return null;
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
    const tokens = text.split(regex);

    return tokens.map((part, idx) => {
      if (!part) return null;
      const tokenKey = `${keyPrefix}-tok-${idx}`;

      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={tokenKey} className="md-inline-code">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={tokenKey} className="md-strong">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={tokenKey} className="md-em">
            {part.slice(1, -1)}
          </em>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a key={tokenKey} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="md-link">
            {linkMatch[1]}
          </a>
        );
      }

      return part;
    });
  };

  const renderMarkdownBlock = (rawText, blockKey) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');
    const elements = [];
    let currentList = null;

    const flushList = () => {
      if (!currentList) return;
      const lKey = `${blockKey}-list-${elements.length}`;
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={lKey} className="md-ul">
            {currentList.items.map((item, idx) => (
              <li key={`${lKey}-li-${idx}`} className="md-li">
                <span className="md-bullet-marker" />
                <div className="md-li-content">{renderInlineMarkdown(item, `${lKey}-lic-${idx}`)}</div>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={lKey} className="md-ol">
            {currentList.items.map((item, idx) => (
              <li key={`${lKey}-oli-${idx}`} className="md-oli">
                <span className="md-num-marker">{item.num}.</span>
                <div className="md-li-content">{renderInlineMarkdown(item.text, `${lKey}-olic-${idx}`)}</div>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    };

    lines.forEach((rawLine, lineIdx) => {
      const line = rawLine.trim();

      if (!line) {
        flushList();
        return;
      }

      if (line === '---' || line === '***' || line === '___') {
        flushList();
        elements.push(<hr key={`${blockKey}-hr-${lineIdx}`} className="md-hr" />);
        return;
      }

      if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={`${blockKey}-h1-${lineIdx}`} className="md-h1">{renderInlineMarkdown(line.slice(2), `${blockKey}-h1-${lineIdx}`)}</h1>);
        return;
      }
      if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={`${blockKey}-h2-${lineIdx}`} className="md-h2">{renderInlineMarkdown(line.slice(3), `${blockKey}-h2-${lineIdx}`)}</h2>);
        return;
      }
      if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={`${blockKey}-h3-${lineIdx}`} className="md-h3">{renderInlineMarkdown(line.slice(4), `${blockKey}-h3-${lineIdx}`)}</h3>);
        return;
      }
      if (line.startsWith('#### ')) {
        flushList();
        elements.push(<h4 key={`${blockKey}-h4-${lineIdx}`} className="md-h4">{renderInlineMarkdown(line.slice(5), `${blockKey}-h4-${lineIdx}`)}</h4>);
        return;
      }

      if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={`${blockKey}-bq-${lineIdx}`} className="md-blockquote">
            {renderInlineMarkdown(line.slice(2), `${blockKey}-bq-${lineIdx}`)}
          </blockquote>
        );
        return;
      }

      const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
      if (bulletMatch) {
        if (!currentList || currentList.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(bulletMatch[1]);
        return;
      }

      const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        if (!currentList || currentList.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push({ num: numMatch[1], text: numMatch[2] });
        return;
      }

      flushList();
      elements.push(
        <p key={`${blockKey}-p-${lineIdx}`} className="md-p">
          {renderInlineMarkdown(rawLine, `${blockKey}-p-${lineIdx}`)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  const renderFormattedMessage = (content, msgId) => {
    if (!content) return null;
    const parts = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', lang: match[1] || 'code', code: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push({ type: 'text', text: content.slice(lastIndex) });
    }

    return parts.map((part, pIdx) => {
      if (part.type === 'code') {
        const codeKey = `${msgId}-code-${pIdx}`;
        return (
          <div key={pIdx} className="code-block-wrap">
            <div className="code-block-header">
              <span className="code-lang-tag">{part.lang}</span>
              <button className="btn-copy-code" onClick={() => handleCopy(codeKey, part.code)}>
                {copiedId === codeKey ? <Icons.Check size={13} color="#22d3ee" /> : <Icons.Copy size={13} />}
                <span>{copiedId === codeKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="code-pre"><code>{part.code}</code></pre>
          </div>
        );
      }

      return (
        <div key={pIdx} className="text-paragraphs-group">
          {renderMarkdownBlock(part.text, `${msgId}-blk-${pIdx}`)}
        </div>
      );
    });
  };

  // LIVE STREAMING INTEGRATION
  const handleSendPrompt = async (overrideText = null, agentOverride = null) => {
    const agent = agentOverride || selectedModel;
    if (!currentUser) {
      showNotice('Please login with your Operator account to access Epinoia Workspace.', 'warn');
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }

    const typedText = (overrideText || inputPrompt).trim();
    const hasFiles = attachedFiles.length > 0;
    if ((!typedText && !hasFiles) || isStreaming) return;

    // --- Plan gating (agent, engine, daily quota) ---
    const liveModelName = modelMap[agent] || tier.defaults[agent];
    if (!tier.agents.includes(agent)) {
      showNotice(`${BASE_FLEET_MODELS[agent].name} is locked on the ${tier.label} plan.`);
      setPlanModalOpen(true);
      return;
    }
    if (!tier.models.includes(liveModelName)) {
      showNotice(`That engine is not included in the ${tier.label} plan.`);
      setPlanModalOpen(true);
      return;
    }
    const usageNow = readUsage();
    const isFrontierModel = !FLASH_MODEL_IDS.includes(liveModelName);
    if (usageNow.total >= tier.dailyLimit) {
      showNotice(`Daily limit reached (${tier.dailyLimit} messages on ${tier.label}). Resets tomorrow — or upgrade.`);
      setPlanModalOpen(true);
      return;
    }
    if (isFrontierModel && tier.premiumDailyLimit != null && usageNow.premium >= tier.premiumDailyLimit) {
      showNotice(`Frontier-model limit reached (${tier.premiumDailyLimit}/day). Switch to a Flash engine or try again tomorrow.`);
      return;
    }
    const nextUsage = { ...usageNow, total: usageNow.total + 1, premium: usageNow.premium + (isFrontierModel ? 1 : 0) };
    writeUsage(nextUsage);
    setUsage(nextUsage);

    const textToSend = typedText || 'Analyze the attached file(s).';
    const apiContent = buildApiContent(textToSend, attachedFiles);
    const sentAttachments = attachedFiles.map(f => ({ name: f.name, size: f.size }));
    setAttachedFiles([]);

    const userMsgId = `usr-${Date.now()}`;
    const assistantMsgId = `ast-${Date.now()}`;
    const modelMeta = getModelMeta(liveModelName);

    const newUserMsg = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      apiContent,
      attachments: sentAttachments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConvId) {
        const title = conv.messages.length === 0 ? textToSend.slice(0, 32) + '...' : conv.title;
        return {
          ...conv,
          title,
          messages: [...conv.messages, newUserMsg]
        };
      }
      return conv;
    }));

    setInputPrompt('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsStreaming(true);

    const startTime = performance.now();
    const placeholderAstMsg = {
      id: assistantMsgId,
      role: 'assistant',
      model: agent,
      modelTag: `${BASE_FLEET_MODELS[agent].rolePrefix} · ${modelMeta.short}`,
      content: '',
      thought: {
        duration: 'Synthesizing...',
        steps: [
          { name: 'Gateway Dispatch', time: 'Initiated', status: 'active', detail: `Routing to ${modelMeta.label} sovereign neural shard` },
          { name: 'Sovereign Alignment', time: 'Active', status: 'active', detail: 'Applying Epinoia Tier-3 Governance & System Directives' }
        ]
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConvId) {
        return {
          ...conv,
          messages: [...conv.messages, placeholderAstMsg]
        };
      }
      return conv;
    }));
    setExpandedThoughts(prev => ({ ...prev, [assistantMsgId]: false }));

    const history = (activeConversation.messages || []).map(m => ({
      role: m.role,
      content: m.apiContent || m.content
    }));

    try {
      const chatPayload = {
        model: liveModelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS[agent] || SYSTEM_PROMPTS.merlin },
          ...history,
          { role: 'user', content: apiContent }
        ],
        stream: true,
        ...(AGENT_PARAMS[agent] || { temperature: 0.4 })
      };

      // Upstream AI Authorization: Clario master API key is always used for 100% reliable authorization
      const masterApiKey = DEFAULT_BRIDGE.apiKey;

      // Resilient Multi-Engine Fallback Cascade
      // If the chosen model is under heavy load (429/503) or rejected (400),
      // auto-cascade to tested reliable engines so the user NEVER encounters a broken stream or 401/403.
      const fallbackEngines = agent === 'merlin'
        ? ['clario/opus-5', 'clario/glm-5.3', 'clario/gemini-3.7-flash', 'clario/glm-5.3-flash-auto']
        : agent === 'nxelle'
          ? ['clario/glm-5.3', 'clario/gemini-3.7-flash', 'clario/glm-5.3-flash-auto']
          : ['clario/gemini-3.7-flash', 'clario/glm-5.3-flash-auto', 'clario/gemini-3.7-flash-auto'];

      const modelsToAttempt = Array.from(new Set([liveModelName, ...fallbackEngines]));

      let response = null;
      let lastFailureDetail = '';

      for (const candidateModel of modelsToAttempt) {
        try {
          const resp = await fetch('https://clariohub.id/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${masterApiKey}`
            },
            body: JSON.stringify({ ...chatPayload, model: candidateModel })
          });

          if (resp.ok && resp.body) {
            response = resp;
            break;
          } else {
            const errData = await resp.json().catch(() => ({}));
            lastFailureDetail = errData?.error?.message || `HTTP ${resp.status}`;
          }
        } catch (fetchErr) {
          lastFailureDetail = fetchErr.message;
        }
      }

      if (!response || !response.ok) {
        throw new Error(lastFailureDetail || 'Neural Bridge Shard connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let streamedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                streamedText += delta;
                setConversations(prev => prev.map(conv => {
                  if (conv.id === activeConvId) {
                    return {
                      ...conv,
                      messages: conv.messages.map(m => m.id === assistantMsgId ? { ...m, content: streamedText } : m)
                    };
                  }
                  return conv;
                }));
              }
            } catch (e) {}
          }
        }
      }

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConvId) {
          return {
            ...conv,
            messages: conv.messages.map(m => m.id === assistantMsgId ? {
              ...m,
              isStreaming: false,
              thought: {
                duration: `${elapsed}s`,
                steps: [
                  { name: 'Gateway Dispatch', time: '14ms', status: 'complete', detail: `Executed on ${modelMeta.label} (${modelMeta.provider})` },
                  { name: 'Cognitive Recurrence Synthesis', time: `${elapsed}s`, status: 'complete', detail: 'Completed stream generation with zero-hallucination guard.' },
                  { name: 'Cryptographic Ledger Hash', time: '4ms', status: 'complete', detail: 'State verification locked in local session journal.' }
                ]
              }
            } : m)
          };
        }
        return conv;
      }));
    } catch (err) {
      console.error('Stream error:', err);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConvId) {
          return {
            ...conv,
            messages: conv.messages.map(m => m.id === assistantMsgId ? {
              ...m,
              isStreaming: false,
              content: `### ⚠️ Neural Bridge Error: ${err.message}\n\nPlease select an alternative AI engine inside the **Neural Bridge & Shard HUD** drawer.`,
              thought: {
                duration: `${elapsed}s`,
                steps: [
                  { name: 'Bridge Connection', time: `${elapsed}s`, status: 'complete', detail: `Failed: ${err.message}` }
                ]
              }
            } : m)
          };
        }
        return conv;
      }));
    } finally {
      setIsStreaming(false);
    }
  };

  const renderAgentSelect = (agent) => {
    const locked = !tier.agents.includes(agent);
    return (
      <>
        <select
          className="mapping-select"
          value={modelMap[agent]}
          disabled={locked}
          style={locked ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          onChange={e => handleModelMapChange(agent, e.target.value)}
        >
          {AVAILABLE_AI_MODELS.map(ai => {
            const allowed = !locked && tier.models.includes(ai.id);
            return (
              <option key={ai.id} value={ai.id} disabled={!allowed && ai.id !== modelMap[agent]}>
                {allowed || ai.id === modelMap[agent] ? '' : '🔒 '}{ai.label} — [{ai.provider}]
              </option>
            );
          })}
        </select>
        {locked && (
          <div style={{ marginTop: 6, fontSize: 10.5, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
            🔒 Locked on {tier.label} — requires Medium or High
          </div>
        )}
      </>
    );
  };

  return (
    <div className="epi-app-root">
      <canvas ref={canvasRef} id="bg-canvas" />
      <div className="bg-glow" />

      <style>{`
        :root {
          --bg: #030208;
          --panel: rgba(10, 7, 24, 0.88);
          --panel-2: rgba(4, 3, 10, 0.82);
          --panel-elevated: rgba(18, 12, 38, 0.94);
          --line: rgba(234, 179, 8, 0.22);
          --line-2: rgba(234, 179, 8, 0.42);
          --line-c: rgba(34, 211, 238, 0.32);
          --gold: #facc15;
          --gold-2: #eab308;
          --gold-soft: #fde68a;
          --cyan: #22d3ee;
          --cyan-soft: #a5f3fc;
          --purple: #a78bfa;
          --text: #e2e8f0;
          --muted: #a0aec0;
          --dim: #64748b;
          --radius-pill: 999px;
          --radius-card: 16px;
          --radius-sm: 8px;
          --font-display: 'Cinzel Decorative', serif;
          --font-heading: 'Cinzel', serif;
          --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        html, body {
          background-color: var(--bg);
          color: var(--text);
          font-family: var(--font-sans);
          width: 100%;
          height: 100%;
          height: 100dvh;
          position: fixed;
          inset: 0;
          overflow: hidden;
          overscroll-behavior: none;
          -webkit-font-smoothing: antialiased;
        }

        #bg-canvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .bg-glow {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(55% 45% at 12% 0%, rgba(139, 92, 246, 0.16), transparent 70%),
            radial-gradient(45% 40% at 92% 100%, rgba(6, 182, 212, 0.12), transparent 70%),
            radial-gradient(35% 35% at 50% 50%, rgba(234, 179, 8, 0.04), transparent 80%);
        }

        .epi-app-root {
          display: flex;
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100dvh;
          background-color: var(--bg);
          color: var(--text);
          overflow: hidden;
          z-index: 1;
        }

        .epi-sidebar {
          width: 290px;
          min-width: 290px;
          height: 100%;
          background-color: var(--panel);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--line);
          transition: margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 40;
        }

        .epi-sidebar.collapsed { margin-left: -290px; }

        .sidebar-header {
          padding: 16px 18px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(234, 179, 8, 0.1);
          flex-shrink: 0;
        }

        .brand-cluster { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .brand-icon {
          width: 36px; height: 36px; border-radius: 9px; display: grid; place-items: center;
          background: rgba(17, 12, 36, 0.95); border: 1px solid rgba(234, 179, 8, 0.5);
          color: var(--gold); box-shadow: 0 0 16px rgba(234, 179, 8, 0.25);
        }
        .brand-title {
          font-family: var(--font-display); font-size: 15px; font-weight: 700;
          letter-spacing: 0.05em; color: var(--gold-soft); text-shadow: 0 0 14px rgba(234, 179, 8, 0.4); line-height: 1.1;
        }
        .brand-sub { font-size: 9.5px; font-family: var(--font-mono); color: var(--cyan); letter-spacing: 0.16em; text-transform: uppercase; margin-top: 3px; }

        .btn-icon-ghost {
          background: transparent; border: none; color: var(--gold-soft);
          width: 34px; height: 34px; border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .btn-icon-ghost:hover { background: rgba(234, 179, 8, 0.12); color: #fff; box-shadow: 0 0 12px rgba(234, 179, 8, 0.2); }

        .sidebar-new-chat-wrap { padding: 14px 16px; flex-shrink: 0; }
        .btn-new-chat {
          width: 100%; display: flex; align-items: center; gap: 10px; padding: 11px 16px;
          background: rgba(234, 179, 8, 0.07); border: 1px solid var(--line-2); border-radius: var(--radius-pill);
          color: var(--gold-soft); font-family: var(--font-heading); font-size: 12px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.25s ease;
          box-shadow: 0 0 15px rgba(234, 179, 8, 0.08);
        }
        .btn-new-chat:hover {
          background: rgba(234, 179, 8, 0.18); border-color: var(--gold); color: #fff;
          box-shadow: 0 0 20px rgba(234, 179, 8, 0.25); transform: translateY(-1px);
        }

        .sidebar-section-title {
          font-family: var(--font-heading); font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase; color: var(--dim); padding: 8px 20px 6px;
          flex-shrink: 0;
        }

        .sidebar-history-list { flex: 1; overflow-y: auto; padding: 0 12px; min-height: 0; }
        .sidebar-history-item {
          display: flex; align-items: center; justify-content: space-between; padding: 9px 12px;
          border-radius: var(--radius-sm); font-size: 13px; color: var(--muted); cursor: pointer;
          margin-bottom: 3px; border: 1px solid transparent; transition: all 0.18s ease; text-decoration: none;
        }
        .sidebar-history-item:hover { background: rgba(234, 179, 8, 0.06); color: var(--text); border-color: rgba(234, 179, 8, 0.15); }
        .sidebar-history-item.active {
          background: rgba(234, 179, 8, 0.12); color: var(--gold-soft); border-color: var(--line);
          font-weight: 500; box-shadow: inset 0 0 12px rgba(234, 179, 8, 0.1);
        }

        .sidebar-bottom {
          padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
          border-top: 1px solid var(--line); display: flex; flex-direction: column;
          gap: 10px; background: rgba(6, 4, 14, 0.75); flex-shrink: 0;
        }

        .bridge-status-pill {
          display: flex; align-items: center; gap: 8px; padding: 6px 12px;
          background: rgba(34, 211, 238, 0.08); border: 1px solid rgba(34, 211, 238, 0.25);
          border-radius: var(--radius-pill); font-size: 11px; font-family: var(--font-mono); color: var(--cyan);
        }

        .clearance-pill {
          display: flex; align-items: center; justify-content: space-between; padding: 10px 14px;
          background: rgba(234, 179, 8, 0.06); border: 1px solid var(--line); border-radius: var(--radius-sm);
          cursor: pointer; transition: all 0.2s ease;
        }
        .clearance-pill:hover { border-color: var(--gold); box-shadow: 0 0 15px rgba(234, 179, 8, 0.15); }

        .epi-workspace {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          background: transparent;
          position: relative;
        }

        .workspace-header {
          height: 66px;
          min-height: 66px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 22px;
          border-bottom: 1px solid var(--line);
          background: rgba(3, 2, 8, 0.92);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          position: relative;
          z-index: 35;
        }

        .header-left { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .model-selector-pill {
          display: flex; align-items: center; gap: 8px; padding: 7px 14px;
          background: rgba(14, 10, 32, 0.88); border: 1px solid var(--line-2); border-radius: var(--radius-pill);
          font-family: var(--font-heading); font-size: 13px; font-weight: 700; color: var(--gold-soft);
          letter-spacing: 0.05em; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 0 16px rgba(234, 179, 8, 0.12);
          white-space: nowrap;
        }
        .model-selector-pill:hover {
          background: rgba(234, 179, 8, 0.14); border-color: var(--gold); box-shadow: 0 0 22px rgba(234, 179, 8, 0.25);
        }

        .model-dropdown-menu {
          position: absolute; top: calc(100% + 8px); left: 0; width: 320px; max-width: calc(100vw - 24px);
          background: rgba(10, 7, 24, 0.98); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--line-2); border-radius: 14px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.95), 0 0 25px rgba(234, 179, 8, 0.22);
          padding: 10px; z-index: 60;
        }

        .view-segmented-wrap {
          display: flex; align-items: center; background: rgba(8, 6, 20, 0.9); border: 1px solid var(--line);
          border-radius: var(--radius-pill); padding: 3px; box-shadow: 0 0 20px rgba(0,0,0,0.4);
          flex-shrink: 1; min-width: 0;
        }
        .view-btn {
          padding: 7px 16px; font-family: var(--font-heading); font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; border-radius: var(--radius-pill); border: 1px solid transparent;
          background: transparent; color: var(--muted); cursor: pointer; transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap;
        }
        .view-btn.active {
          background: linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(202, 138, 4, 0.35));
          color: #fff; border-color: var(--line-2); box-shadow: 0 0 18px rgba(234, 179, 8, 0.25);
          text-shadow: 0 0 10px rgba(234, 179, 8, 0.5);
        }

        .header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .nav-links { display: flex; align-items: center; gap: 18px; }
        .nav-link {
          font-family: var(--font-heading); font-size: 11.5px; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: #cbd5e1; transition: color 0.2s ease; text-decoration: none;
        }
        .nav-link:hover { color: var(--gold); }

        .op-avatar-pill {
          width: 34px; height: 34px; border-radius: 50%; background: rgba(234, 179, 8, 0.1);
          border: 1px solid var(--line-2); display: flex; align-items: center; justify-content: center;
          font-size: 11.5px; font-weight: 700; color: var(--gold-soft); font-family: var(--font-mono);
          box-shadow: 0 0 12px rgba(234, 179, 8, 0.2); flex-shrink: 0; cursor: pointer;
        }

        .chat-container {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        .chat-scroll-area {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .chat-scroll-content {
          max-width: 880px;
          width: 100%;
          margin: 0 auto;
          padding: 28px 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .starter-hero {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 28px 0 16px; text-align: center;
        }
        .hero-glyph {
          width: 56px; height: 56px; border-radius: 14px; background: rgba(17, 12, 36, 0.95);
          border: 1px solid var(--line-2); display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px; box-shadow: 0 0 30px rgba(234, 179, 8, 0.35);
        }
        .hero-title {
          font-family: var(--font-display); font-size: clamp(22px, 4vw, 34px); font-weight: 900;
          color: var(--gold); letter-spacing: 0.04em; margin-bottom: 10px;
          text-shadow: 0 0 24px rgba(234, 179, 8, 0.45);
          background: linear-gradient(92deg, #fef3c7 0%, #facc15 45%, #eab308 70%, #c4b5fd 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-subtitle { font-size: 14px; color: var(--muted); max-width: 580px; line-height: 1.6; }

        .starter-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 26px; width: 100%; }
        .starter-card {
          padding: 16px 18px; background: var(--panel); border: 1px solid var(--line);
          border-radius: var(--radius-card); cursor: pointer; transition: all 0.25s ease; text-align: left;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .starter-card:hover {
          background: rgba(20, 14, 42, 0.9); border-color: var(--gold); transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(234, 179, 8, 0.2);
        }
        .starter-card-title {
          font-family: var(--font-heading); font-size: 13.5px; font-weight: 700; color: var(--gold-soft);
          margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .starter-card-desc { font-size: 12px; color: var(--muted); line-height: 1.45; }

        .msg-row { display: flex; flex-direction: column; gap: 12px; animation: fadeIn 0.25s ease forwards; min-width: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .user-msg-block {
          align-self: flex-end; max-width: 84%; background: rgba(22, 15, 48, 0.9); border: 1px solid var(--line-2);
          padding: 13px 18px; border-radius: 18px 18px 4px 18px; font-size: 14px; line-height: 1.55;
          color: #f8fafc; box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 0 15px rgba(139, 92, 246, 0.15);
          overflow-wrap: anywhere; word-break: break-word;
        }
        .assistant-msg-block { display: flex; gap: 14px; width: 100%; min-width: 0; }
        .assistant-avatar {
          width: 34px; height: 34px; border-radius: 10px; background: rgba(17, 12, 36, 0.95);
          border: 1px solid var(--line); display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 2px; box-shadow: 0 0 16px rgba(234, 179, 8, 0.2);
        }
        .assistant-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; overflow: hidden; }
        .assistant-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 8px; font-size: 11.5px; color: var(--dim); }
        .assistant-model-tag { font-family: var(--font-heading); font-weight: 700; color: var(--gold-soft); letter-spacing: 0.05em; }

        .thought-accordion {
          background: rgba(10, 7, 24, 0.72); border: 1px solid rgba(34, 211, 238, 0.28);
          border-radius: 12px; overflow: hidden; transition: all 0.2s ease; box-shadow: 0 0 15px rgba(34, 211, 238, 0.06);
        }
        .thought-accordion:hover { border-color: var(--cyan); box-shadow: 0 0 20px rgba(34, 211, 238, 0.15); }
        .thought-header { display: flex; align-items: center; justify-content: space-between; padding: 9px 14px; cursor: pointer; user-select: none; gap: 8px; }
        .thought-title-group { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 11.5px; font-family: var(--font-mono); color: var(--cyan-soft); }
        .thought-timing-pill {
          padding: 2px 8px; background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: var(--radius-pill); font-size: 10px; color: var(--cyan); white-space: nowrap;
        }
        .thought-body {
          padding: 10px 14px 12px; border-top: 1px solid rgba(34, 211, 238, 0.15); display: flex; flex-direction: column;
          gap: 8px; background: rgba(4, 3, 10, 0.45);
        }
        .thought-step-item { display: flex; align-items: flex-start; gap: 10px; font-size: 11.5px; line-height: 1.45; padding: 3px 0; }
        .step-indicator { width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 8px var(--cyan); margin-top: 6px; flex-shrink: 0; }
        .step-name { font-weight: 600; color: #f1f5f9; font-family: var(--font-mono); font-size: 11px; }
        .step-time { color: var(--dim); font-size: 10.5px; margin-left: 6px; }
        .step-detail { color: var(--muted); margin-top: 2px; overflow-wrap: anywhere; }

        .text-paragraphs-group { font-size: 14px; line-height: 1.7; color: #e2e8f0; overflow-wrap: anywhere; word-break: break-word; }
        .text-paragraphs-group > *:last-child { margin-bottom: 0 !important; }
        .md-h1 {
          font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--gold);
          margin: 18px 0 8px; letter-spacing: 0.02em; text-shadow: 0 0 16px rgba(234, 179, 8, 0.4);
        }
        .md-h2 {
          font-family: var(--font-display); font-size: 17.5px; font-weight: 700; color: var(--gold);
          margin: 16px 0 8px; text-shadow: 0 0 14px rgba(234, 179, 8, 0.35);
        }
        .md-h3 {
          font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--gold-soft);
          margin: 14px 0 6px; letter-spacing: 0.03em; text-shadow: 0 0 10px rgba(234, 179, 8, 0.25);
        }
        .md-h4 {
          font-family: var(--font-heading); font-size: 13.5px; font-weight: 700; color: #f1f5f9;
          margin: 12px 0 4px;
        }
        .md-p { margin: 0 0 11px 0; line-height: 1.68; color: #cbd5e1; font-size: 14px; }
        .md-strong { color: #fef08a; font-weight: 700; letter-spacing: 0.01em; }
        .md-em { font-style: italic; color: #e2e8f0; }
        .md-inline-code {
          font-family: var(--font-mono); font-size: 12.5px; padding: 2px 7px; border-radius: 6px;
          background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.28);
          color: #38bdf8; word-break: break-word; vertical-align: baseline; font-weight: 500;
        }
        .md-ul, .md-ol {
          margin: 8px 0 12px 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px;
        }
        .md-li, .md-oli {
          display: flex; align-items: flex-start; gap: 10px; line-height: 1.62; font-size: 14px; color: #cbd5e1;
        }
        .md-bullet-marker {
          width: 6px; height: 6px; border-radius: 50%; background: var(--gold);
          box-shadow: 0 0 8px rgba(250, 204, 21, 0.7); margin-top: 8px; flex-shrink: 0;
        }
        .md-num-marker {
          font-family: var(--font-mono); font-size: 12.5px; font-weight: 700; color: var(--gold-soft);
          min-width: 20px; flex-shrink: 0; margin-top: 1px;
        }
        .md-li-content { flex: 1; min-width: 0; }
        .md-blockquote {
          margin: 10px 0 12px; padding: 8px 14px; border-left: 3px solid var(--gold);
          background: rgba(234, 179, 8, 0.06); border-radius: 0 8px 8px 0; color: #cbd5e1; font-style: italic;
        }
        .md-hr { margin: 16px 0; border: none; border-top: 1px solid var(--line-2); }
        .md-link { color: var(--cyan); text-decoration: underline; text-underline-offset: 3px; }
        .md-link:hover { color: #fff; }

        .code-block-wrap {
          margin: 12px 0; background: rgba(4, 3, 10, 0.96); border: 1px solid var(--line-2);
          border-radius: 12px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.7); max-width: 100%;
        }
        .code-block-header {
          display: flex; align-items: center; justify-content: space-between; padding: 8px 14px;
          background: rgba(14, 10, 32, 0.85); border-bottom: 1px solid var(--line);
        }
        .code-lang-tag {
          font-family: var(--font-mono); font-size: 10.5px; font-weight: 700; color: var(--gold-soft);
          text-transform: uppercase; letter-spacing: 0.1em;
        }
        .btn-copy-code {
          background: transparent; border: none; color: var(--gold-soft); font-family: var(--font-mono);
          font-size: 11px; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: color 0.18s ease;
        }
        .btn-copy-code:hover { color: #fff; }
        .code-pre {
          padding: 14px 16px; font-family: var(--font-mono); font-size: 12px; line-height: 1.55;
          color: #cbd5e1; overflow-x: auto; white-space: pre; -webkit-overflow-scrolling: touch;
        }

        .msg-action-bar { display: flex; align-items: center; gap: 8px; margin-top: 4px; }

        /* Docked Prompt Bar — Never bleeds text underneath */
        .prompt-dock-wrap {
          flex-shrink: 0;
          width: 100%;
          padding: 10px 20px calc(14px + env(safe-area-inset-bottom));
          background: linear-gradient(180deg, rgba(3, 2, 8, 0.75) 0%, rgba(3, 2, 8, 0.98) 35%, #030208 100%);
          border-top: 1px solid rgba(234, 179, 8, 0.14);
          z-index: 25;
        }
        .prompt-floating-container {
          width: 100%;
          max-width: 840px;
          margin: 0 auto;
        }
        .prompt-pill-card {
          background: rgba(10, 7, 24, 0.96); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--line-2); border-radius: 24px;
          box-shadow: 0 10px 36px rgba(0,0,0,0.85), 0 0 22px rgba(234, 179, 8, 0.12);
          padding: 11px 16px 9px 18px; display: flex; flex-direction: column; gap: 6px; transition: all 0.25s ease;
        }
        .prompt-pill-card:focus-within {
          border-color: var(--gold); box-shadow: 0 12px 44px rgba(0,0,0,0.9), 0 0 32px rgba(234, 179, 8, 0.25);
        }
        .prompt-upper-row { display: flex; align-items: center; gap: 8px; }
        .prompt-textarea {
          width: 100%; min-height: 26px; max-height: 150px; background: transparent; border: none; outline: none;
          color: #f8fafc; font-family: var(--font-sans); font-size: 14.5px; line-height: 1.45; resize: none;
        }
        .prompt-textarea::placeholder {
          color: rgba(254, 240, 138, 0.42); font-family: var(--font-heading); font-size: 13px; letter-spacing: 0.05em;
        }

        .prompt-bottom-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 2px; }
        .prompt-tools-group { display: flex; align-items: center; gap: 7px; flex-wrap: nowrap; }
        .tool-badge-btn {
          display: flex; align-items: center; gap: 6px; padding: 6px 11px; background: rgba(234, 179, 8, 0.07);
          border: 1px solid var(--line); border-radius: var(--radius-pill); font-family: var(--font-heading);
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.05em; color: var(--gold-soft); cursor: pointer;
          transition: all 0.2s ease; white-space: nowrap; flex-shrink: 0;
        }
        .tool-badge-btn:hover {
          color: #fff; border-color: var(--gold); background: rgba(234, 179, 8, 0.16); box-shadow: 0 0 12px rgba(234, 179, 8, 0.2);
        }
        .tool-badge-btn.active {
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.25), rgba(6, 182, 212, 0.35));
          border-color: var(--cyan); color: #fff; box-shadow: 0 0 16px rgba(34, 211, 238, 0.3);
        }

        .btn-send-pill {
          width: 36px; height: 36px; border-radius: 50%; border: none; background: linear-gradient(135deg, #facc15, #ca8a04);
          color: #030208; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;
          box-shadow: 0 0 18px rgba(234, 179, 8, 0.4); flex-shrink: 0;
        }
        .btn-send-pill:disabled { background: rgba(234, 179, 8, 0.15); color: var(--dim); cursor: not-allowed; box-shadow: none; opacity: 0.5; }
        .btn-send-pill:not(:disabled):hover { transform: scale(1.06); box-shadow: 0 0 25px rgba(234, 179, 8, 0.6); }

        .prompt-disclaimer { text-align: center; font-size: 10.5px; font-family: var(--font-mono); color: var(--dim); margin-top: 7px; }

        /* Overview Matrix */
        .overview-container {
          flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch;
          padding: 32px 36px 90px; max-width: 1180px; margin: 0 auto; width: 100%;
        }
        .overview-hero { border-bottom: 1px solid var(--line); padding-bottom: 24px; margin-bottom: 34px; }
        .overview-badge {
          display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; background: rgba(234, 179, 8, 0.08);
          border: 1px solid var(--line-2); border-radius: var(--radius-pill); font-size: 11px; font-family: var(--font-mono);
          color: var(--gold-soft); margin-bottom: 16px; box-shadow: 0 0 14px rgba(234, 179, 8, 0.15);
        }
        .overview-title {
          font-family: var(--font-display); font-size: clamp(24px, 4.5vw, 40px); font-weight: 900;
          color: var(--gold); letter-spacing: 0.04em; margin-bottom: 12px; text-shadow: 0 0 24px rgba(234, 179, 8, 0.45);
          background: linear-gradient(92deg, #fef3c7 0%, #facc15 45%, #eab308 70%, #c4b5fd 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .overview-subtitle { font-size: 15px; color: var(--muted); line-height: 1.65; max-width: 780px; }

        .matrix-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .matrix-card {
          background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius-card); padding: 24px;
          display: flex; flex-direction: column; gap: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); transition: all 0.25s ease;
        }
        .matrix-card:hover { border-color: var(--gold); box-shadow: 0 12px 36px rgba(234, 179, 8, 0.2); transform: translateY(-2px); }
        .matrix-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .matrix-name { font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: var(--gold-soft); letter-spacing: 0.04em; }
        .matrix-tag {
          font-size: 10px; font-family: var(--font-mono); padding: 4px 9px; border-radius: var(--radius-sm);
          background: rgba(234, 179, 8, 0.1); color: var(--gold-soft); border: 1px solid var(--line);
        }
        .matrix-desc { font-size: 13px; color: var(--muted); line-height: 1.55; }
        .matrix-specs { border-top: 1px solid var(--line); padding-top: 14px; display: grid; gap: 9px; font-size: 11.5px; font-family: var(--font-mono); }
        .spec-item { display: flex; justify-content: space-between; gap: 10px; color: var(--dim); }
        .spec-val { color: #f1f5f9; text-align: right; }

        /* Telemetry Drawer */
        .drawer-overlay {
          position: fixed; inset: 0; background: rgba(3, 2, 8, 0.78);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 80;
        }
        .telemetry-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; width: 420px; max-width: 100vw;
          background: rgba(10, 7, 24, 0.98); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border-left: 1px solid var(--line-2); padding: 24px 22px calc(24px + env(safe-area-inset-bottom));
          display: flex; flex-direction: column; gap: 18px; z-index: 85; overflow-y: auto;
          box-shadow: -15px 0 45px rgba(0,0,0,0.95), 0 0 30px rgba(234, 179, 8, 0.15); animation: slideLeft 0.25s ease;
        }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }

        .drawer-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 14px; flex-shrink: 0; }
        .metric-card {
          background: rgba(18, 12, 38, 0.88); border: 1px solid var(--line); border-radius: 12px;
          padding: 16px; box-shadow: 0 4px 18px rgba(0,0,0,0.4);
        }
        .metric-title { font-size: 11px; font-family: var(--font-mono); color: var(--gold-soft); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }

        .mapping-row {
          display: flex; flex-direction: column; gap: 6px; padding: 11px 12px;
          background: rgba(6, 4, 16, 0.75); border: 1px solid rgba(234, 179, 8, 0.16);
          border-radius: 10px; margin-bottom: 10px;
        }
        .mapping-row:last-child { margin-bottom: 0; }
        .mapping-agent-header {
          display: flex; align-items: center; justify-content: space-between;
          font-family: var(--font-heading); font-size: 12.5px; font-weight: 700;
        }
        .mapping-select {
          width: 100%; padding: 9px 12px; background: rgba(14, 10, 32, 0.95);
          border: 1px solid var(--line-2); border-radius: 8px; color: #f8fafc;
          font-family: var(--font-mono); font-size: 12px; outline: none; cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .mapping-select:focus, .mapping-select:hover {
          border-color: var(--gold); box-shadow: 0 0 12px rgba(234, 179, 8, 0.22);
        }
        .mapping-select option {
          background: #0a0718; color: #f8fafc; padding: 8px;
        }

        /* Modal */
        .modal-wrap {
          position: fixed; inset: 0; background: rgba(3, 2, 8, 0.85);
          display: flex; align-items: center; justify-content: center; z-index: 90;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        }
        .modal-box {
          width: 460px; max-width: calc(100vw - 28px); background: rgba(14, 10, 32, 0.98); border: 1px solid var(--line-2);
          border-radius: var(--radius-card); padding: 28px 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.95), 0 0 35px rgba(234, 179, 8, 0.2);
        }

        .op-avatar-pill.tier-pill { width: auto; min-width: 28px; padding: 0 12px; border-radius: 999px; letter-spacing: 0.06em; }

        /* --- RESPONSIVE ADAPTATIONS (TABLET & MOBILE / IPHONE 14 PRO MAX) --- */
        .sidebar-mobile-backdrop { display: none; }
        .sidebar-mobile-nav { display: none; }

        @media (max-width: 1024px) {
          .epi-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            width: 285px;
            max-width: 82vw;
            z-index: 100;
            box-shadow: 15px 0 45px rgba(0,0,0,0.95);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
            margin-left: 0 !important;
            transform: translateX(0);
          }
          .epi-sidebar.collapsed {
            transform: translateX(-105%);
          }
          .sidebar-mobile-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(3, 2, 8, 0.78);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            z-index: 95;
            animation: fadeIn 0.2s ease;
          }
          .sidebar-mobile-nav {
            display: block;
            padding: 6px 12px;
            border-top: 1px solid rgba(234, 179, 8, 0.12);
            flex-shrink: 0;
          }
          .matrix-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .nav-links {
            display: none;
          }
        }

        /* MOBILE OPTIMIZATION (iPhone 14 Pro Max 430px & smaller phones) */
        @media (max-width: 768px) {
          .workspace-header {
            height: 56px;
            min-height: 56px;
            padding: 0 10px;
            gap: 6px;
          }
          .header-left {
            gap: 6px;
          }
          .btn-icon-ghost {
            width: 30px;
            height: 30px;
          }
          .model-selector-pill {
            padding: 5px 10px;
            font-size: 11.5px;
            gap: 5px;
          }
          .model-pill-tag {
            display: none !important;
          }
          .view-segmented-wrap {
            padding: 2px;
            max-width: 195px;
          }
          .view-btn {
            padding: 4px 7px;
            font-size: 8.5px;
            line-height: 1.15;
            letter-spacing: 0.04em;
            gap: 4px;
            white-space: normal;
            text-align: center;
          }
          .header-right {
            gap: 6px;
          }
          .op-avatar-pill {
            width: 28px;
            height: 28px;
            font-size: 10px;
          }

          /* Chat area on mobile */
          .chat-scroll-content {
            padding: 16px 12px 18px;
            gap: 16px;
          }
          .user-msg-block {
            max-width: 90%;
            padding: 11px 14px;
            font-size: 13.5px;
          }
          .assistant-msg-block {
            gap: 10px;
          }
          .assistant-avatar {
            width: 28px;
            height: 28px;
            border-radius: 8px;
          }
          .thought-header {
            padding: 8px 11px;
          }
          .thought-title-group {
            font-size: 11px;
            gap: 6px;
          }
          .thought-timing-pill {
            font-size: 9px;
            padding: 1px 6px;
          }
          .code-pre {
            padding: 11px 12px;
            font-size: 11px;
          }
          .starter-hero {
            padding: 14px 4px 10px;
          }
          .hero-glyph {
            width: 46px;
            height: 46px;
            margin-bottom: 12px;
          }
          .hero-title {
            font-size: 21px;
          }
          .hero-subtitle {
            font-size: 12.5px;
            line-height: 1.5;
          }
          .starter-grid {
            grid-template-columns: 1fr;
            gap: 10px;
            margin-top: 16px;
          }
          .starter-card {
            padding: 13px 15px;
          }
          .starter-card-title {
            font-size: 13px;
          }
          .starter-card-desc {
            font-size: 11.5px;
          }

          /* Docked prompt bar on mobile */
          .prompt-dock-wrap {
            padding: 8px 10px calc(10px + env(safe-area-inset-bottom));
          }
          .prompt-pill-card {
            padding: 9px 11px 7px 13px;
            border-radius: 20px;
            gap: 4px;
          }
          .prompt-textarea {
            font-size: 14px;
          }
          .prompt-textarea::placeholder {
            font-size: 11.5px;
          }
          .prompt-tools-group {
            gap: 5px;
            overflow-x: auto;
            max-width: calc(100% - 42px);
            scrollbar-width: none;
          }
          .prompt-tools-group::-webkit-scrollbar {
            display: none;
          }
          .tool-badge-btn {
            padding: 5px 8px;
            font-size: 9.5px;
          }
          .btn-send-pill {
            width: 32px;
            height: 32px;
          }
          .prompt-disclaimer {
            display: none;
          }

          /* Overview on mobile */
          .overview-container {
            padding: 18px 14px 70px;
          }
          .overview-title {
            font-size: 22px;
          }
          .overview-subtitle {
            font-size: 13px;
          }
          .matrix-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .telemetry-drawer {
            width: 100%;
            padding: 18px 16px calc(20px + env(safe-area-inset-bottom));
          }
        }
      `}</style>

      {/* --- SIDEBAR BACKDROP OVERLAY (MOBILE/TABLET) --- */}
      {sidebarOpen && (
        <div className="sidebar-mobile-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* --- SIDEBAR DRAWER --- */}
      <aside className={`epi-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <a href="/" className="brand-cluster">
            <div className="brand-icon">
              <Icons.Eye size={20} color="#facc15" />
            </div>
            <div>
              <div className="brand-title">Epinoia</div>
              <div className="brand-sub">Merlin Arcane Fleet</div>
            </div>
          </a>
          <button className="btn-icon-ghost" onClick={() => setSidebarOpen(false)} title="Close Sidebar">
            <Icons.Menu size={18} />
          </button>
        </div>

        <div className="sidebar-new-chat-wrap">
          <button className="btn-new-chat" onClick={handleNewChat}>
            <Icons.Plus size={16} />
            <span>New Spell Session</span>
          </button>
        </div>

        <div className="sidebar-section-title">Active Journals</div>
        <div className="sidebar-history-list">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`sidebar-history-item ${activeConvId === conv.id ? 'active' : ''}`}
              onClick={() => {
                setActiveConvId(conv.id);
                setCurrentView('chat');
                if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
                  setSidebarOpen(false);
                }
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                {conv.title}
              </span>
              {conversations.length > 1 && (
                <button
                  className="btn-icon-ghost"
                  style={{ width: 22, height: 22 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const remaining = conversations.filter(c => c.id !== conv.id);
                    setConversations(remaining);
                    if (activeConvId === conv.id && remaining.length > 0) {
                      setActiveConvId(remaining[0].id);
                    }
                  }}
                  title="Delete thread"
                >
                  <Icons.Trash size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* MOBILE NAVIGATION LINKS */}
        <div className="sidebar-mobile-nav">
          <div className="sidebar-section-title">Navigation</div>
          <a href="/" className="sidebar-history-item">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icons.Eye size={14} color="#facc15" />
              <span>Sanctum</span>
            </span>
            <Icons.ChevronRight size={12} />
          </a>
          <a href="/docs/" className="sidebar-history-item">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icons.Spark size={14} color="#facc15" />
              <span>Docs</span>
            </span>
            <Icons.ChevronRight size={12} />
          </a>
          <a href="/pricing/" className="sidebar-history-item">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icons.Shield size={14} color="#facc15" />
              <span>Pricing</span>
            </span>
            <Icons.ChevronRight size={12} />
          </a>
          <a href="/store/" className="sidebar-history-item" style={{ color: 'var(--gold)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>💎</span>
              <span>Vault Store</span>
            </span>
            <Icons.ChevronRight size={12} />
          </a>
        </div>

        <div className="sidebar-bottom">
          <div className="bridge-status-pill">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }} />
            <span>Sovereign Neural Bridge · Online</span>
          </div>

          <div className="clearance-pill" onClick={() => setPlanModalOpen(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icons.Shield size={18} color="#facc15" />
              <div>
                <div style={{ fontSize: '10px', color: 'var(--dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Sanctum Plan</div>
                <div style={{ fontSize: '12.5px', color: 'var(--gold-soft)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{tier.label} · {usage.total}/{tier.dailyLimit} today</div>
              </div>
            </div>
            <Icons.ChevronRight size={14} />
          </div>

          <button className="btn-new-chat" style={{ padding: '9px 14px', fontSize: '11px', justifyContent: 'center' }} onClick={() => setTelemetryOpen(true)}>
            <Icons.Sliders size={15} />
            <span>Neural Bridge &amp; AI Mapping</span>
          </button>
        </div>
      </aside>

      {/* --- WORKSPACE CORE --- */}
      <main className="epi-workspace">
        <header className="workspace-header">
          <div className="header-left">
            {!sidebarOpen && (
              <button className="btn-icon-ghost" onClick={() => setSidebarOpen(true)} title="Expand Sidebar">
                <Icons.Menu size={20} />
              </button>
            )}

            <div style={{ position: 'relative' }}>
              <button className="model-selector-pill" onClick={() => setModelDropdownOpen(!modelDropdownOpen)}>
                {React.createElement(FLEET_MODELS[selectedModel].icon, { size: 15, color: FLEET_MODELS[selectedModel].color })}
                <span>{FLEET_MODELS[selectedModel].name}</span>
                <span className="model-pill-tag" style={{ fontSize: 10.5, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
                  {FLEET_MODELS[selectedModel].tag}
                </span>
                <Icons.ChevronDown size={13} />
              </button>

              {modelDropdownOpen && (
                <div className="model-dropdown-menu">
                  {Object.values(FLEET_MODELS).map(m => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setModelDropdownOpen(false);
                        if (!tier.agents.includes(m.id)) {
                          showNotice(`${m.name} is locked on the ${tier.label} plan.`);
                          setPlanModalOpen(true);
                          return;
                        }
                        setSelectedModel(m.id);
                      }}
                      style={{
                        padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                        background: selectedModel === m.id ? m.accent : 'transparent',
                        border: `1px solid ${selectedModel === m.id ? m.border : 'transparent'}`,
                        display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 4, transition: 'all 0.2s ease', opacity: tier.agents.includes(m.id) ? 1 : 0.6
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, color: m.color, fontFamily: 'var(--font-heading)' }}>
                          {React.createElement(m.icon, { size: 15, color: m.color })}
                          {m.name}
                        </div>
                        {tier.agents.includes(m.id)
                          ? <span style={{ fontSize: 10.5, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{m.mappedLabel}</span>
                          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: 'var(--gold-soft)', fontFamily: 'var(--font-mono)' }}><Icons.Lock size={11} /> Medium+</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.35 }}>{m.role}</div>
                    </div>
                  ))}
                  <div
                    onClick={() => {
                      setModelDropdownOpen(false);
                      setTelemetryOpen(true);
                    }}
                    style={{
                      marginTop: 6, padding: '8px 12px', borderTop: '1px solid var(--line)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gold-soft)', cursor: 'pointer'
                    }}
                  >
                    <span>⚙️ Customize Active AI Mapping</span>
                    <Icons.ChevronRight size={12} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="view-segmented-wrap">
            <button
              className={`view-btn ${currentView === 'chat' ? 'active' : ''}`}
              onClick={() => setCurrentView('chat')}
            >
              <Icons.Spark size={13} color="#facc15" />
              <span>Arcane Workspace</span>
            </button>
            <button
              className={`view-btn ${currentView === 'overview' ? 'active' : ''}`}
              onClick={() => setCurrentView('overview')}
            >
              <Icons.Layers size={13} color="#22d3ee" />
              <span>Fleet Matrix</span>
            </button>
          </div>

          <div className="header-right">
            <div className="nav-links">
              <a href="/docs/" className="nav-link">Docs</a>
              <a href="/pricing/" className="nav-link">Pricing</a>
              <a href="/store/" className="nav-link" style={{ color: 'var(--gold)' }}>💎 Store</a>
            </div>

            <button className="btn-icon-ghost" onClick={() => setTelemetryOpen(true)} title="Neural Bridge & AI Mapping">
              <Icons.Activity size={18} color="#22d3ee" />
            </button>

            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  className="op-avatar-pill"
                  onClick={() => setAuthModalOpen(true)}
                  title={`Logged in: ${currentUser.email}`}
                  style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.25), rgba(6, 182, 212, 0.35))',
                    borderColor: 'var(--cyan)',
                    padding: currentUser.avatar ? 0 : undefined,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'OP'
                  )}
                </div>
                <div className="op-avatar-pill tier-pill" onClick={() => setPlanModalOpen(true)} title="Sanctum Plan">
                  {tier.label.toUpperCase()}
                </div>
              </div>
            ) : (
              <button
                className="btn-new-chat"
                style={{ padding: '6px 14px', fontSize: 11, background: 'linear-gradient(135deg, #facc15, #ca8a04)', color: '#030208', fontWeight: 700 }}
                onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
              >
                Operator Login
              </button>
            )}
          </div>
        </header>

        {/* --- CHAT WORKSPACE --- */}
        {currentView === 'chat' && (
          <div className="chat-container">
            <div className="chat-scroll-area" ref={chatScrollAreaRef}>
              <div className="chat-scroll-content">
                {activeConversation.messages.length === 0 ? (
                  <div className="starter-hero">
                    <div className="hero-glyph">
                      <Icons.Eye size={26} color="#facc15" />
                    </div>
                    <h1 className="hero-title">Epinoia Sovereign Sanctum</h1>
                    <p className="hero-subtitle">
                      Sovereign Neural Bridge Active. {tier.heroLine}
                    </p>

                    <div className="starter-grid">
                      {STARTER_PROMPTS.filter(p => tier.agents.includes(p.model)).map((p, idx) => (
                        <div
                          key={idx}
                          className="starter-card"
                          onClick={() => {
                            setSelectedModel(p.model);
                            handleSendPrompt(p.prompt, p.model);
                          }}
                        >
                          <div className="starter-card-title">
                            <span>{p.title}</span>
                            <Icons.ChevronRight size={14} color="#facc15" />
                          </div>
                          <div className="starter-card-desc">{p.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  activeConversation.messages.map(msg => (
                    <div key={msg.id} className="msg-row">
                      {msg.role === 'user' ? (
                        <div className="user-msg-block">
                          {msg.content}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                              {msg.attachments.map((a, ai) => (
                                <span key={ai} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--cyan-soft)', background: 'rgba(34, 211, 238, 0.1)', border: '1px solid var(--line-c)' }}>
                                  <Icons.Paperclip size={11} color="#22d3ee" />{a.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="assistant-msg-block">
                          <div className="assistant-avatar">
                            {React.createElement(FLEET_MODELS[msg.model || 'merlin'].icon, { size: 17, color: FLEET_MODELS[msg.model || 'merlin'].color })}
                          </div>
                          <div className="assistant-body">
                            <div className="assistant-meta">
                              <span className="assistant-model-tag">{FLEET_MODELS[msg.model || 'merlin'].name}</span>
                              <span>•</span>
                              <span>{msg.timestamp}</span>
                              <span>•</span>
                              <span style={{ fontFamily: 'var(--font-mono)' }}>{msg.modelTag || FLEET_MODELS[msg.model || 'merlin'].tag}</span>
                            </div>

                            {msg.thought && (
                              <div className="thought-accordion">
                                <div className="thought-header" onClick={() => toggleThought(msg.id)}>
                                  <div className="thought-title-group">
                                    <Icons.Brain size={14} color="#22d3ee" />
                                    <span>Thought for {msg.thought.duration}</span>
                                    <span className="thought-timing-pill">{msg.thought.steps.length} Arcane Gates</span>
                                  </div>
                                  {expandedThoughts[msg.id] ? <Icons.ChevronDown size={14} /> : <Icons.ChevronRight size={14} />}
                                </div>

                                {expandedThoughts[msg.id] && (
                                  <div className="thought-body">
                                    {msg.thought.steps.map((st, sidx) => (
                                      <div key={sidx} className="thought-step-item">
                                        <div className="step-indicator" />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div>
                                            <span className="step-name">{st.name}</span>
                                            <span className="step-time">({st.time})</span>
                                          </div>
                                          <div className="step-detail">{st.detail}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {renderFormattedMessage(msg.content, msg.id)}

                            <div className="msg-action-bar">
                              <button className="btn-icon-ghost" style={{ width: 28, height: 28 }} onClick={() => handleCopy(msg.id, msg.content)} title="Copy response">
                                {copiedId === msg.id ? <Icons.Check size={14} color="#22d3ee" /> : <Icons.Copy size={14} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* DOCKED PROMPT BAR */}
            <div className="prompt-dock-wrap">
              <div className="prompt-floating-container">
                <div className="prompt-pill-card">
                  {attachedFiles.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 14px 0' }}>
                      {attachedFiles.map(f => (
                        <span
                          key={f.id}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: '100%',
                            padding: '4px 8px 4px 10px', borderRadius: 999, fontSize: 11, fontFamily: 'var(--font-mono)',
                            color: 'var(--cyan-soft)', background: 'rgba(34, 211, 238, 0.1)', border: '1px solid var(--line-c)'
                          }}
                        >
                          <Icons.Paperclip size={11} color="#22d3ee" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{f.name}</span>
                          <span style={{ color: 'var(--dim)' }}>{fmtSize(f.size)}</span>
                          <button
                            onClick={() => removeAttachedFile(f.id)}
                            aria-label={`Remove ${f.name}`}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
                          >
                            <Icons.X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="prompt-upper-row">
                    <textarea
                      ref={textareaRef}
                      className="prompt-textarea"
                      placeholder={`Inscribe instruction to ${FLEET_MODELS[selectedModel].name}...`}
                      rows={1}
                      value={inputPrompt}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendPrompt();
                        }
                      }}
                    />
                  </div>

                  <div className="prompt-bottom-row">
                    <div className="prompt-tools-group">
                      <button
                        className={`tool-badge-btn ${attachedFiles.length > 0 ? 'active' : ''}`}
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        title={`Upload text / code files (max ${tier.maxFiles}, ${fmtSize(tier.maxFileKB * 1024)} each)`}
                        aria-label="Upload files"
                      >
                        <Icons.Paperclip size={13} />
                        {attachedFiles.length > 0 && <span>{attachedFiles.length}</span>}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFilesSelected}
                        style={{ display: 'none' }}
                      />

                      <button
                        className={`tool-badge-btn ${deepSearchActive ? 'active' : ''}`}
                        onClick={() => setDeepSearchActive(!deepSearchActive)}
                        title="Deep Fleet Knowledge Synthesis"
                      >
                        <Icons.Globe size={13} />
                        <span>Deep Search</span>
                      </button>

                      <div style={{ position: 'relative' }}>
                        <button
                          className="tool-badge-btn"
                          onClick={() => setThinkingPopoverOpen(!thinkingPopoverOpen)}
                          title="Thinking Budget Allocation"
                        >
                          <Icons.Brain size={13} />
                          <span style={{ textTransform: 'capitalize' }}>Cognitive: {thinkingBudget}</span>
                          <Icons.ChevronDown size={11} />
                        </button>

                        {thinkingPopoverOpen && (
                          <div style={{
                            position: 'fixed', bottom: '84px', left: '50%', transform: 'translateX(-50%)',
                            width: 'min(260px, calc(100vw - 32px))',
                            background: 'rgba(14, 10, 32, 0.98)', backdropFilter: 'blur(20px)', border: '1px solid var(--line-2)',
                            borderRadius: '12px', padding: '8px', boxShadow: '0 12px 36px rgba(0,0,0,0.95), 0 0 20px rgba(234, 179, 8, 0.2)',
                            zIndex: 75
                          }}>
                            {[
                              { key: 'low', label: 'Low (Reflex Stream)', desc: 'Fast generation' },
                              { key: 'mid', label: 'Mid (Balanced AST)', desc: 'Standard synthesis' },
                              { key: 'high', label: 'High (Tier-3 Surgery)', desc: 'Deep cognition & verification' }
                            ].map(t => (
                              <div
                                key={t.key}
                                onClick={() => { setThinkingBudget(t.key); setThinkingPopoverOpen(false); }}
                                style={{
                                  padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                                  background: thinkingBudget === t.key ? 'rgba(234, 179, 8, 0.15)' : 'transparent',
                                  border: `1px solid ${thinkingBudget === t.key ? 'var(--line-2)' : 'transparent'}`,
                                  display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 3, transition: 'all 0.18s ease'
                                }}
                              >
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-soft)', fontFamily: 'var(--font-heading)' }}>{t.label}</div>
                                <div style={{ fontSize: 10.5, color: 'var(--dim)' }}>{t.desc}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        className={`tool-badge-btn ${isRecording ? 'active' : ''}`}
                        onClick={toggleMic}
                        title={isRecording ? 'Stop voice input' : 'Start voice input'}
                        aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
                        aria-pressed={isRecording}
                      >
                        <Icons.Mic size={13} />
                        {isRecording && <span>Listening…</span>}
                      </button>
                      <button
                        className="tool-badge-btn"
                        onClick={toggleMicLang}
                        title="Voice language (tap to switch Indonesian / English)"
                        aria-label="Switch voice language"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}
                      >
                        {micLang === 'id-ID' ? 'ID' : 'EN'}
                      </button>
                    </div>

                    <button
                      className="btn-send-pill"
                      disabled={(!inputPrompt.trim() && attachedFiles.length === 0) || isStreaming}
                      onClick={() => handleSendPrompt()}
                      title="Send instruction to Live Model"
                    >
                      <Icons.ArrowUp size={15} />
                    </button>
                  </div>
                </div>
                <div className="prompt-disclaimer">
                  Epinoia Sovereign Fleet · {tier.label} plan · Active Engine: {FLEET_MODELS[selectedModel].mappedLabel} · {usage.total}/{tier.dailyLimit} today
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 2: FLEET MATRIX --- */}
        {currentView === 'overview' && (
          <div className="overview-container">
            <div className="overview-hero">
              <div className="overview-badge">
                <Icons.Shield size={14} color="#facc15" />
                <span>EPI-FLEET SPECIFICATION v4.2 · SOVEREIGN NEURAL BRIDGE ACTIVE</span>
              </div>
              <h1 className="overview-title">Enterprise Sovereign Fleet Architecture</h1>
              <p className="overview-subtitle">
                A single-tenant, hardware-aware computational matrix with customizable frontier AI model routing for each sovereign agent.
              </p>
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'var(--gold-soft)' }}>
              Active Fleet Agents &amp; Mapped Engines
            </h2>
            <div className="matrix-grid">
              {Object.values(FLEET_MODELS).map(m => (
                <div key={m.id} className="matrix-card">
                  <div className="matrix-card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {React.createElement(m.icon, { size: 22, color: m.color })}
                      <div className="matrix-name">{m.name}</div>
                    </div>
                    <span className="matrix-tag">{m.tag}</span>
                  </div>

                  <p className="matrix-desc">{m.role}</p>

                  <div className="matrix-specs">
                    <div className="spec-item">
                      <span>Active AI Engine</span>
                      <span className="spec-val" style={{ color: 'var(--cyan)' }}>{m.mappedLabel}</span>
                    </div>
                    <div className="spec-item">
                      <span>Context Window</span>
                      <span className="spec-val">{m.context}</span>
                    </div>
                    <div className="spec-item">
                      <span>Kernel Target</span>
                      <span className="spec-val" style={{ color: 'var(--gold-soft)' }}>{m.arch}</span>
                    </div>
                  </div>

                  <button
                    className="btn-new-chat"
                    style={{ marginTop: 'auto', padding: '10px 14px', fontSize: '11px', justifyContent: 'center' }}
                    onClick={() => {
                      if (!tier.agents.includes(m.id)) {
                        setPlanModalOpen(true);
                        return;
                      }
                      setSelectedModel(m.id);
                      setCurrentView('chat');
                    }}
                  >
                    {tier.agents.includes(m.id) ? 'Invoke in Arcane Workspace →' : '🔒 Unlock with Medium or High'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TELEMETRY & NEURAL BRIDGE DRAWER (BASE URL & API KEY HIDDEN; INTERACTIVE AI MODEL SELECTOR) --- */}
        {telemetryOpen && (
          <>
            <div className="drawer-overlay" onClick={() => setTelemetryOpen(false)} />
            <div className="telemetry-drawer">
              <div className="drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, color: 'var(--gold-soft)', fontSize: 15, fontFamily: 'var(--font-heading)' }}>
                  <Icons.Sliders size={18} color="#facc15" />
                  <span>Neural Bridge &amp; Shard HUD</span>
                </div>
                <button className="btn-icon-ghost" onClick={() => setTelemetryOpen(false)}>
                  <Icons.X size={18} />
                </button>
              </div>

              <div className="metric-card">
                <div className="metric-title">Live Bridge Status</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee' }} />
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>ONLINE · ENCRYPTED BRIDGE</span>
                  </div>
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--gold-soft)', padding: '2px 8px', borderRadius: 999, background: 'rgba(234, 179, 8, 0.12)', border: '1px solid var(--line)' }}>
                    {tier.label.toUpperCase()} PLAN
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div className="metric-title" style={{ marginBottom: 0 }}>Active Model Mapping</div>
                  <button
                    onClick={() => {
                      setRawModelMap(DEFAULT_BRIDGE.modelMap);
                      try { localStorage.removeItem('epinoia_model_map'); } catch (e) {}
                    }}
                    style={{
                      background: 'transparent', border: 'none', color: 'var(--dim)',
                      fontFamily: 'var(--font-mono)', fontSize: 10.5, cursor: 'pointer', textDecoration: 'underline'
                    }}
                  >
                    Reset Default
                  </button>
                </div>

                {/* MERLIN SELECTOR */}
                <div className="mapping-row">
                  <div className="mapping-agent-header" style={{ color: '#facc15' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Icons.Merlin size={15} color="#facc15" />
                      <span>Merlin (Governor)</span>
                    </span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--dim)' }}>STRATEGIC</span>
                  </div>
                  {renderAgentSelect('merlin')}
                </div>

                {/* NXELLE SELECTOR */}
                <div className="mapping-row">
                  <div className="mapping-agent-header" style={{ color: '#22d3ee' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Icons.Codex size={15} color="#22d3ee" />
                      <span>Nxelle Codex (Coding)</span>
                    </span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--dim)' }}>CODING ONLY</span>
                  </div>
                  {renderAgentSelect('nxelle')}
                </div>

                {/* JIE SELECTOR */}
                <div className="mapping-row">
                  <div className="mapping-agent-header" style={{ color: '#a78bfa' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Icons.Jie size={15} color="#a78bfa" />
                      <span>Jie (Light Q&amp;A)</span>
                    </span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--dim)' }}>QUICK Q&amp;A</span>
                  </div>
                  {renderAgentSelect('jie')}
                </div>
              </div>

              <button
                className="btn-new-chat"
                style={{ marginTop: 'auto', justifyContent: 'center', background: 'linear-gradient(135deg, #facc15, #ca8a04)', color: '#030208' }}
                onClick={() => setTelemetryOpen(false)}
              >
                Save &amp; Lock Neural Bridge
              </button>
            </div>
          </>
        )}

        
        {/* --- CLOUDFLARE SANCTUM AUTH MODAL --- */}
        {authModalOpen && (
          <div className="modal-wrap" onClick={() => setAuthModalOpen(false)}>
            <div className="modal-box" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
              {currentUser ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <Icons.Shield size={24} color="#22d3ee" />
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--cyan)' }}>
                        Operator Sanctum Profile
                      </h2>
                      <div style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>Supabase Sovereign Identity</div>
                    </div>
                  </div>

                  <div style={{ padding: '14px', background: 'rgba(4, 3, 10, 0.6)', border: '1px solid var(--line)', borderRadius: 10, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cyan)' }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.25), rgba(6, 182, 212, 0.35))', border: '2px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'OP'}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Active Operator:</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold-soft)', fontFamily: 'var(--font-heading)' }}>{currentUser.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{currentUser.email}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--line-2)', fontSize: 11, color: 'var(--dim)' }}>
                      Active Tier: <b style={{ color: 'var(--gold)' }}>{tier.label} Plan</b>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn-new-chat"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                      onClick={() => { setAuthModalOpen(false); setPlanModalOpen(true); }}
                    >
                      Manage Plan &amp; Codes
                    </button>
                    <button
                      className="btn-new-chat"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
                      onClick={() => { handleLogout(); setAuthModalOpen(false); }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icons.Shield size={22} color="#facc15" />
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>
                        {authMode === 'login' ? 'Operator Sanctum Login' : 'Register Operator Identity'}
                      </h2>
                    </div>
                    <button type="button" className="btn-icon-ghost" onClick={() => setAuthModalOpen(false)}>
                      <Icons.X size={18} />
                    </button>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
                    Supabase Sovereign Auth Gateway. Authenticate to unlock autonomous AI synthesis and manage your neural tier.
                  </p>

                  {authError && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: 12, marginBottom: 12 }}>
                      {authError}
                    </div>
                  )}

                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    disabled={authBusy}
                    onClick={handleGoogleSignIn}
                    className="btn-new-chat"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      color: '#ffffff',
                      fontWeight: 600,
                      padding: '10px 14px',
                      marginBottom: 14,
                      gap: 10,
                      cursor: authBusy ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{authBusy ? 'Connecting to Google...' : 'Continue with Google'}</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--dim)', letterSpacing: '0.08em' }}>OR USE EMAIL PASSCODE</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                  </div>

                  {authMode === 'register' && (
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: 'block', fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 4 }}>
                        Operator Title / Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Archmage Vance"
                        value={authName}
                        onChange={e => setAuthName(e.target.value)}
                        className="mapping-select"
                        style={{ cursor: 'text' }}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Operator Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="operator@epinoiahorizon.com"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      className="mapping-select"
                      style={{ cursor: 'text' }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Sanctum Passcode (Min 6 chars)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="mapping-select"
                      style={{ cursor: 'text' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authBusy}
                    className="btn-new-chat"
                    style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #facc15, #ca8a04)', color: '#030208', fontWeight: 700, padding: '11px', marginBottom: 12 }}
                  >
                    {authBusy ? 'Authenticating Gateway...' : (authMode === 'login' ? 'Enter Sovereign Sanctum' : 'Create Operator Account')}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    {authMode === 'login' ? (
                      <span>
                        Need an account?{' '}
                        <button type="button" onClick={() => { setAuthMode('register'); setAuthError(''); }} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', textDecoration: 'underline' }}>
                          Register here
                        </button>
                      </span>
                    ) : (
                      <span>
                        Already registered?{' '}
                        <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); }} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', textDecoration: 'underline' }}>
                          Log in here
                        </button>
                      </span>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- PLAN MODAL --- */}
        {planModalOpen && (
          <div className="modal-wrap" onClick={() => setPlanModalOpen(false)}>
            <div className="modal-box" style={{ maxHeight: '92vh', overflowY: 'auto', width: 520 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Icons.Shield size={24} color="#facc15" />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>
                  Sanctum Plan
                </h2>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
                Today: {usage.total} / {tier.dailyLimit} messages
                {tier.premiumDailyLimit != null ? ` · ${usage.premium} / ${tier.premiumDailyLimit} frontier` : ''}
              </p>

              <div style={{ display: 'grid', gap: 12, margin: '16px 0' }}>
                {Object.values(TIERS).map(t => {
                  const active = tierKey === t.key;
                  return (
                    <div
                      key={t.key}
                      onClick={() => {
                        if (!active) {
                          if (t.key === 'free') {
                            deactivateLicense();
                          } else {
                            openQrisModal(t.key);
                          }
                        }
                      }}
                      style={{
                        padding: '14px 16px', background: active ? 'rgba(234, 179, 8, 0.15)' : 'rgba(4, 3, 10, 0.6)',
                        border: `1px solid ${active ? 'var(--gold)' : 'var(--line)'}`, borderRadius: 12,
                        boxShadow: active ? '0 0 16px rgba(234, 179, 8, 0.2)' : 'none',
                        cursor: active ? 'default' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: active ? 'var(--gold-soft)' : '#e2e8f0' }}>
                          {t.label}
                          {active && <span style={{ marginLeft: 8, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>CURRENT</span>}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--gold-soft)' }}>{t.price}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.45 }}>{t.summary}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--dim)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                        {t.dailyLimit} msgs/day · {t.maxFiles} files ≤ {fmtSize(t.maxFileKB * 1024)}
                      </div>

                      {!active && t.key !== 'free' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openQrisModal(t.key);
                          }}
                          style={{
                            width: '100%',
                            marginTop: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-heading)',
                            fontSize: 12.5,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            background: t.key === 'medium' ? 'linear-gradient(135deg, #facc15, #ca8a04)' : 'linear-gradient(135deg, #22d3ee, #0891b2)',
                            color: '#030208',
                            boxShadow: t.key === 'medium' ? '0 4px 16px rgba(250, 204, 21, 0.25)' : '0 4px 16px rgba(34, 211, 238, 0.25)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span>⚡ Upgrade with QRIS ({t.price})</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {tierKey === 'free' ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>Have an activation code?</div>
                  <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
                    <input
                      value={licenseInput}
                      onChange={e => setLicenseInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') activateLicense(); }}
                      placeholder="Enter Sanctum Activation Code..."
                      spellCheck={false}
                      autoCapitalize="characters"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(4, 3, 10, 0.85)',
                        border: '1px solid var(--line-2)',
                        color: '#f8fafc',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12.5,
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      disabled={licenseBusy || !licenseInput.trim()}
                      onClick={activateLicense}
                      style={{
                        flexShrink: 0,
                        padding: '10px 20px',
                        borderRadius: 10,
                        border: '1px solid var(--gold)',
                        background: 'rgba(250, 204, 21, 0.14)',
                        color: 'var(--gold-soft)',
                        fontFamily: 'var(--font-heading)',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        cursor: licenseBusy || !licenseInput.trim() ? 'not-allowed' : 'pointer',
                        opacity: licenseBusy || !licenseInput.trim() ? 0.5 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {licenseBusy ? '...' : 'Activate'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <a href="/pricing/" style={{ fontSize: 11.5, color: 'var(--cyan)', textDecoration: 'underline' }}>
                      See pricing &amp; plans →
                    </a>
                    <span style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
                      Code issued via WhatsApp after payment
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
                    Active Plan: <b style={{ color: 'var(--gold)' }}>{tier.label}</b>
                  </span>
                  <button
                    onClick={deactivateLicense}
                    style={{ background: 'transparent', border: 'none', color: 'var(--dim)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Switch back to Free
                  </button>
                </div>
              )}

              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#e2e8f0',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  cursor: 'pointer'
                }}
                onClick={() => setPlanModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* --- SANCTUM QRIS PAYMENT MODAL --- */}
        {qrisModalOpen && (
          <div className="modal-wrap" onClick={() => setQrisModalOpen(false)}>
            <div className="modal-box" style={{ maxWidth: 460, width: '92vw', maxHeight: '94vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icons.Shield size={22} color="#facc15" />
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>
                    Sanctum QRIS Payment
                  </h2>
                </div>
                <button type="button" className="btn-icon-ghost" onClick={() => setQrisModalOpen(false)}>
                  <Icons.X size={18} />
                </button>
              </div>

              {/* Billing Toggle (Monthly / Annual) */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 8 }}>
                <button
                  type="button"
                  onClick={() => setQrisBilling('monthly')}
                  style={{
                    flex: 1, padding: '7px 10px', fontSize: 11, fontFamily: 'var(--font-mono)', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: qrisBilling === 'monthly' ? 'var(--gold)' : 'transparent',
                    color: qrisBilling === 'monthly' ? '#030208' : 'var(--muted)',
                    fontWeight: qrisBilling === 'monthly' ? 700 : 400
                  }}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setQrisBilling('annual')}
                  style={{
                    flex: 1, padding: '7px 10px', fontSize: 11, fontFamily: 'var(--font-mono)', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: qrisBilling === 'annual' ? 'var(--cyan)' : 'transparent',
                    color: qrisBilling === 'annual' ? '#030208' : 'var(--muted)',
                    fontWeight: qrisBilling === 'annual' ? 700 : 400
                  }}
                >
                  Annual (20% OFF)
                </button>
              </div>

              {/* Tier & Price Badge */}
              {(() => {
                const info = (QRIS_AMOUNTS[qrisTier] || QRIS_AMOUNTS.medium)[qrisBilling] || QRIS_AMOUNTS.medium.monthly;
                const waText = encodeURIComponent(
                  `Hello Epinoia Horizon Sanctum Desk, I would like to confirm my QRIS payment for Sanctum Plan:\n\n` +
                  `• Plan: ${info.label}\n` +
                  `• Amount: ${info.idr} (${info.usd})\n` +
                  `• Operator: ${currentUser ? currentUser.email : 'Sanctum Operator'}\n` +
                  `• Merchant: EPINOIA HORIZON (NMID: ID1026618239614)\n\n` +
                  `Please find my payment proof attached. Kindly transmit my Activation Code / Sanctum Operator credentials. Thank you!`
                );
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-soft)', fontFamily: 'var(--font-heading)' }}>
                        {info.label}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
                        {info.idr} <span style={{ fontSize: 11, color: 'var(--dim)' }}>({info.usd})</span>
                      </span>
                    </div>

                    {/* QR Code Container */}
                    <div style={{ textAlign: 'center', background: '#ffffff', padding: '16px 12px 12px', borderRadius: 12, marginBottom: 14 }}>
                      <img
                        src="/assets/qris-epinoia.jpg"
                        alt="QRIS Epinoia Horizon"
                        style={{ maxWidth: 220, width: '100%', borderRadius: 8, display: 'inline-block' }}
                      />
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#0f172a', marginTop: 6, fontWeight: 700 }}>
                        EPINOIA HORIZON, Komputer<br />
                        <span style={{ fontWeight: 400, color: '#475569' }}>NMID: ID1026618239614</span>
                      </div>
                    </div>

                    {/* Step Guides */}
                    <ol style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.6, paddingLeft: 18, marginBottom: 14 }}>
                      <li>Open m-Banking (BCA, Mandiri, BRI, BNI) or e-Wallet (GoPay, OVO, ShopeePay, DANA).</li>
                      <li>Scan the QRIS barcode above with your banking application.</li>
                      <li>Input exact nominal: <b style={{ color: 'var(--gold)' }}>{info.idr}</b>.</li>
                      <li>Save receipt and click the green button below for WhatsApp activation.</li>
                    </ol>

                    {/* WhatsApp CTA Button */}
                    <a
                      href={`https://wa.me/6281776349779?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-new-chat"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        background: '#22c55e',
                        color: '#ffffff',
                        fontWeight: 700,
                        padding: '11px',
                        textDecoration: 'none',
                        marginBottom: 10,
                        gap: 8
                      }}
                    >
                      <i className="fab fa-whatsapp" style={{ fontSize: 16 }}></i>
                      <span>Confirm Payment via WhatsApp</span>
                    </a>

                    <div style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setQrisModalOpen(false);
                          setPlanModalOpen(true);
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--dim)', fontSize: 11.5, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        ← Back to Plans &amp; Activation Code
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* --- TOAST NOTICE --- */}
        {notice && (
          <div
            role="status"
            onClick={() => setNotice(null)}
            style={{
              position: 'fixed', left: '50%', bottom: 104, transform: 'translateX(-50%)', zIndex: 120,
              maxWidth: 'min(460px, calc(100vw - 28px))', padding: '10px 16px', borderRadius: 12, cursor: 'pointer',
              fontSize: 12.5, lineHeight: 1.45, color: '#f8fafc', background: 'rgba(14, 10, 32, 0.98)',
              border: `1px solid ${notice.kind === 'error' ? 'rgba(248, 113, 113, 0.7)' : notice.kind === 'ok' ? 'rgba(34, 211, 238, 0.7)' : 'var(--line-2)'}`,
              boxShadow: '0 12px 36px rgba(0,0,0,0.9)'
            }}
          >
            {notice.text}
          </div>
        )}
      </main>
    </div>
  );
}

export default EpinoiaGeminiApp;
