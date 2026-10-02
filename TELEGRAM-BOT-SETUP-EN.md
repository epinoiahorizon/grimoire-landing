# 📱 Telegram Bot Setup for Merlin — 5-Minute Guide
*(Share-ready — for anyone with Merlin already installed, e.g. Mark on markpc)*

## Prerequisites
- Merlin installed and responding: `merlin --version` works (Linux WSL/VPS, macOS, Windows native — all supported)
- Terminal access on that machine (SSH or local)
- Telegram on your phone

---

## Step 1 — Create the bot in Telegram (phone, ~1 min)

1. Open Telegram, search **@BotFather** (the verified one)
2. Send `/newbot`
3. Choose a **display name** — anything, e.g. `Mark Grimoire Bot`
4. Choose a **username** — must end in `bot`, e.g. `mark_grimoire_bot`
5. BotFather replies with a **token** that looks like:
   `123456789:ABCdefGHI-jklMNOpqrSTUvwxYZ`
   ⚠️ **This token is the key. Never share it in chats, groups, or screenshots.**

## Step 2 — Install the token via the wizard (terminal, ~1 min)

```bash
merlin gateway setup
```

- Choose the **Telegram** section
- Two paths appear:
  - **[1] Automatic** (QR code) — recommended; the token flows in by itself, nothing to copy-paste
  - **[2] Manual** — paste the token from BotFather (input is password-masked)
- Use **[2] Manual** if you already created the bot in Step 1
- The wizard saves it to `~/.merlin/.env` as `TELEGRAM_BOT_TOKEN`

## Step 3 — Allowlist: lock the bot to yourself (~30 sec)

Still in the same wizard, it asks about **allowed users** — without this, *anyone*
in the world who finds the bot can use it:

1. In Telegram, message **@userinfobot** → it replies with your numeric **Id** (e.g. `8621864972`)
2. Type that number into the `Allowed user IDs (comma-separated)` prompt
3. The wizard saves it as `TELEGRAM_ALLOWED_USERS` in `~/.merlin/.env`

## Step 4 — Activate & connect (~1 min)

```bash
merlin gateway restart
```

The gateway will:
- Read the token → log in to Telegram via the Bot API
- Spin up a fresh agent session (same brain, tools, and skills as Merlin in the CLI)
- You can check state at any time:

```bash
merlin gateway status
# telegram platform: state: connected ...
```

## Step 5 — Pair yourself (~30 sec)

1. From Telegram, send **any message** to your bot (e.g. `hello`)
2. The bot replies with a **pairing code** (6 characters, valid 1 hour), e.g.:
   `XYSQKPK4`
3. Approve it in the terminal:
   ```bash
   merlin pairing approve telegram <CODE>
   ```
   → `Approved! User <name> (<id>) ...`
4. Send your message again in Telegram → this time the bot ANSWERS. Done. ✧

---

## Troubleshooting — what usually goes wrong

| Symptom | Common cause | Fix |
|---|---|---|
| Bot never sends a pairing code | Gateway not connected yet | `merlin gateway status` — confirm `state: connected`, no `error_code` |
| `error_code: 401` in status | Token wrong/typed wrong | `merlin gateway setup` → reconfigure Telegram → paste token again |
| `error_code: 409 / conflict` | Same token used by 2 apps (e.g. Merlin + Hermes) | Create a SEPARATE bot per app via BotFather; 1 token = 1 consumer |
| Bot replies "I don't recognize you yet" | Not approved yet | Run the pairing approve command with the code the bot gave |
| "anyone can use your bot!" warning | Empty allowlist | Re-run `merlin gateway setup` → Telegram section → set `TELEGRAM_ALLOWED_USERS` |
| Bot dead after VPS reboot | Service not enabled | `merlin gateway install` (registers systemd service) then `merlin gateway start` |

## Daily-driver command map

```bash
merlin gateway status        # platform connection health
merlin pairing list          # who's approved / pending
merlin pairing approve telegram <code>    # when a new user pings
merlin pairing revoke telegram <user_id>  # pull someone's access
merlin gateway restart       # after manually changing token/allowlist
merlin update                # code updates — token & pairing are NEVER touched
```

## Three security rules (non-negotiable)

1. **The token is never typed anywhere except the wizard (masked) or BotFather.** Not in chats, not in tickets, not in notes.
2. **Always fill the allowlist** — a bot without `TELEGRAM_ALLOWED_USERS` is an open door to the agent running on your server.
3. **One bot per app** — Merlin, Hermes, etc. each need their OWN bot. One token in two places = getUpdates conflicts and a confused bot.

---
*Official docs: merlin docs → gateway; this summary is written from the verified wizard (setup_platforms.py + telegram adapter). — ✧ Epinoia Horizon, 2026*