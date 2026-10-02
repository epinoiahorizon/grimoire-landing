# 📱 Setup Bot Telegram untuk Merlin — Panduan 5 Menit
*(Share ke siapa saja yang sudah terinstall Merlin — mis. mark / XIBU di markpc)*

## Prasyarat
- Merlin sudah terinstall & lulus `merlin --version` (Linux WSL/VPS/macOS/Windows native semua bisa)
- Akses terminal mesin tersebut (SSH atau lokal)
- Telegram di HP

---

## Langkah 1 — Buat bot di Telegram (di HP, ±1 menit)

1. Buka Telegram, cari **@BotFather** (bot biru resmi)
2. Kirim `/newbot`
3. Jawab **nama bot** — bebas, mis: `Mark Grimoire Bot`
4. Jawab **username bot** — harus diakhiri `bot`, mis: `mark_grimoire_bot`
5. BotFather membalas dengan **token** berbentuk:
   `123456789:ABCdefGHI-jklMNOpqrSTUvwxYZ`
   ⚠️ **Token ini = kunci. JANGAN share ke siapa pun / grup / screenshot.**

## Langkah 2 — Pasang token lewat wizard (di terminal, ±1 menit)

```bash
merlin gateway setup
```

- Pilih bagian **Telegram**
- Muncul dua pilihan:
  - **[1] Automatic** (QR code) — direkomendasikan; token masuk sendiri, tidak perlu copy-paste
  - **[2] Manual** — paste token dari BotFather (diketik ter-mask)
- Pakai **[2] Manual** kalau bot-nya sudah dibuat sebelumnya (Langkah 1)
- Wizard menyimpannya ke `~/.merlin/.env` sebagai `TELEGRAM_BOT_TOKEN`

## Langkah 3 — Allowlist: kunci bot ke dirimu sendiri (±30 detik)

Masih di wizard yang sama, dia bertanya soal **allowed users** — bot tanpa ini
bisa dipakai siapa saja di dunia yang menemukannya:

1. Di Telegram, chat **@userinfobot** → dia membalas dengan **Id** kamu (angka, mis: `8621864972`)
2. Ketik angka itu ke prompt `Allowed user IDs (comma-separated)`
3. Wizard menyimpannya ke `~/.merlin/.env` sebagai `TELEGRAM_ALLOWED_USERS`

## Langkah 4 — Aktifkan & hubungkan (±1 menit)

```bash
merlin gateway restart
```

Gateway akan:
- Membaca token → login ke Telegram via Bot API
- Membuat sesi agent baru (otak + tools + skills sama seperti Merlin di CLI)
- Statusnya bisa dicek kapan pun:

```bash
merlin gateway status
# telegraf platform telegram: state: connected ...
```

## Langkah 5 — Pasangkan dirimu (pairing, ±30 detik)

1. Dari Telegram, kirim **pesan apa saja** ke bot-mu (mis: `halo`)
2. Bot membalas dengan **pairing code** (6 karakter, berlaku 1 jam), contoh:
   `XYSQKPK4`
3. Di terminal, approve:
   ```bash
   merlin pairing approve telegram <KODE>
   ```
   → `Approved! User <nama> (<id>) ...`
4. Kirim lagi pesanmu di Telegram → kali ini bot MENJAWAB. Selesai. ✧

---

## Ceh cek cepat kalau ada hambatan

| Gejala | Sebab umum | Perbaikan |
|---|---|---|
| Bot tidak mengirim pairing code | Gateway belum connect | `merlin gateway status` — pastikan `state: connected`, no `error_code` |
| `error_code: 401` di status | Token salah/ketuker | `merlin gateway setup` → reconfigure Telegram → paste ulang token |
| `error_code: 409 / conflict` | Token yang sama dipakai 2 aplikasi (mis. Merlin + Hermes) | Buat bot TERPISAH untuk tiap aplikasi via BotFather; 1 token = 1 pengguna |
| Pesan dibalas "I don't recognize you yet" | Belum di-approve | Jalankan perintah pairing approve dari kode yang bot berikan |
| "anyone can use your bot!" warning | Allowlist kosong | `merlin gateway setup` lagi → bagian Telegram → set `TELEGRAM_ALLOWED_USERS` |
| Bot mati setelah reboot VPS | Service belum enabled | `merlin gateway install` (mendaftar sebagai service systemd) lalu `merlin gateway start` |

## Peta perintah untuk pengguna sehari-hari

```bash
merlin gateway status        # kondisi koneksi platform
merlin pairing list          # siapa yang sudah di-approve / pending
merlin pairing approve telegram <kode>   # saat ada pengguna baru
merlin pairing revoke telegram <user_id> # cabut akses
merlin gateway restart       # setelah mengganti token/allowlist secara manual
merlin update                # update kode — token & pairing TIDAK disentuh
```

## Tiga aturan keamanan (WAJIB ditaati)

1. **Token tidak pernah diketik di chat/applikasi lain** — hanya di wizard (masked) atau BotFather.
2. **Selalu isi allowlist** — bot tanpa `TELEGRAM_ALLOWED_USERS` = pintu terbuka ke agent-mu di server.
3. **Satu bot per aplikasi** — Merlin, Hermes, dll. masing-masing butuh bot sendiri; token yang sama dipakai dua tempat = konflik getUpdates dan bot kacau.

---
*Dokumen resmi: merlin docs → gateway; ringkasan di sini ditulis dari wizard yang sudah terverifikasi (setup_platforms.py + adapter telegram).* — ✧ Epinoia Horizon, 2026