#!/usr/bin/env python3
"""Metering v0 — customer usage statement generator (Trust-in-Processes asset).

Reads the per-node session DB (state.db, table session_model_usage — it already
records every API call with tokens + estimated cost) and emits:
  1. JSONL append-only usage log        (grimoire_state/usage-YYYYMM.jsonl)
  2. Markdown monthly statement         (grimoire_state/statement-YYYYMM.md)
     — designed to be attached to the invoice: model spend, totals, daily curve.

Usage (on a customer node):
  python3 statement.py                       # current month
  python3 statement.py --month 2026-09       # any month
  python3 statement.py --once                # no cron assumptions (manual run)

Cron contract (installed by grimoire.sh later): daily 03:00, quiet on success,
non-zero exit + stderr on problem — never silently empty (silent ticks are the
failure mode the Grimoire ops book bans).
"""
import argparse
import json
import os
import sqlite3
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

MERLIN_HOME = Path(os.environ.get("MERLIN_HOME", str(Path.home() / ".merlin")))
DB = MERLIN_HOME / "state.db"
OUT_DIR = MERLIN_HOME / "grimoire_state"


def month_bounds(month: str | None):
    now = datetime.now(timezone.utc)
    if month:
        y, m = int(month[:4]), int(month[5:7])
    else:
        y, m = now.year, now.month
    start = datetime(y, m, 1, tzinfo=timezone.utc).timestamp()
    end = (datetime(y + (m == 12), (m % 12) + 1, 1, tzinfo=timezone.utc)).timestamp()
    return y, m, start, end


def collect(y: int, m: int, start: float, end: float):
    con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
    rows = con.execute(
        """SELECT session_id, model, platform, api_call_count,
                  input_tokens, output_tokens, cache_read_tokens,
                  estimated_cost_usd, first_seen, last_seen
             FROM session_model_usage
            WHERE last_seen >= ? AND first_seen < ?
        """, (start, end)).fetchall() if False else None
    # NOTE: session_model_usage in deployed schemas mirrors hermes: a platform col
    # may not exist yet; probe columns and adapt instead of assuming.
    cols = [r[1] for r in con.execute("PRAGMA table_info(session_model_usage)")]
    select_cols = ["session_id", "model"]
    if "platform" in cols:
        select_cols.append("platform")
    select_cols += ["api_call_count", "input_tokens", "output_tokens",
                    "cache_read_tokens", "estimated_cost_usd", "first_seen", "last_seen"]
    rows = con.execute(
        f"SELECT {', '.join(select_cols)} FROM session_model_usage "
        f"WHERE last_seen >= ? AND first_seen < ?", (start, end)).fetchall()
    con.close()
    records, by_day, by_model = [], defaultdict(lambda: [0, 0, 0, 0.0]), defaultdict(lambda: [0, 0, 0, 0.0])
    for r in rows:
        rec = dict(zip(select_cols, r))
        records.append(rec)
        day = datetime.fromtimestamp(rec["last_seen"], tz=timezone.utc).strftime("%Y-%m-%d")
        for d in (by_day, by_model):
            bucket = d[day] if d is by_day else d[rec["model"]]
            bucket[0] += rec["api_call_count"]
            bucket[1] += rec["input_tokens"] + rec["output_tokens"]
            bucket[2] += rec["cache_read_tokens"]
            bucket[3] += rec["estimated_cost_usd"]
    return records, by_day, by_model


def write_jsonl(records, y, m):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"usage-{y:04d}{m:02d}.jsonl"
    with open(path, "a", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps({**rec, "_exported_at": time.time()}) + "\n")
    return path


def write_statement(y, m, by_day, by_model):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"statement-{y:04d}{m:02d}.md"
    total_calls = sum(v[0] for v in by_day.values())
    total_tokens = sum(v[1] for v in by_day.values())
    total_cost = sum(v[3] for v in by_day.values())
    lines = [
        f"# Grimoire Usage Statement — {y:04d}-{m:02d}",
        "",
        f"machine_id: `{(MERLIN_HOME / 'grimoire_state.json').exists() and json.load(open(MERLIN_HOME / 'grimoire_state.json')).get('machine_id', 'unknown') or 'unknown'}`",
        f"generated: {datetime.now(timezone.utc).isoformat()}",
        f"model_calls: {total_calls:,}   tokens: {total_tokens:,}   est_spend: ${total_cost:.2f}",
        "",
        "## Daily",
        "",
        "| day | calls | tokens | cache-read | est $ |",
        "|---|---:|---:|---:|---:|",
    ]
    for day in sorted(by_day):
        calls, tok, cr, cost = by_day[day]
        lines.append(f"| {day} | {calls:,} | {tok:,} | {cr:,} | {cost:.2f} |")
    lines += ["", "## By model", ""]
    for model in sorted(by_model):
        calls, tok, cr, cost = by_model[model]
        lines.append(f"- **{model}** — {calls:,} calls / {tok:,} tok / ${cost:.2f}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--month", help="YYYY-MM (default: current month)")
    ap.add_argument("--once", action="store_true", help="manual run; skip cron contract")
    args = ap.parse_args()
    y, m, start, end = month_bounds(args.month)
    records, by_day, by_model = collect(y, m, start, end)
    if not records:
        # cron contract: never silent-empty on problem; empty month may be legit
        if not args.once:
            print("no usage rows for period", file=sys.stderr)
        sys.exit(1 if not args.once else 0)
    p1 = write_jsonl(records, y, m)
    p2 = write_statement(y, m, by_day, by_model)
    print(f"usage jsonl: {p1}")
    print(f"statement:   {p2}")


if __name__ == "__main__":
    main()