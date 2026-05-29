#!/usr/bin/env python3
"""Polls the monitoring stack and writes a small curated status.json.

This sidecar runs on the `monitoring_monitoring` network alongside the portfolio
container. It queries Prometheus (black-box probe) and Loki (unique visitors from
the structured nginx access logs) on an interval and writes a flat, curated JSON
file to a shared volume that the portfolio nginx serves at /status.json.

Deliberately dependency-free (stdlib only) and deliberately *not* a proxy: only
four curated fields ever leave this process — no IPs, no internal hostnames, no
query passthrough. The upstream APIs are never exposed publicly.
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone

PROM_URL = os.environ.get("PROM_URL", "http://prometheus:9090")
LOKI_URL = os.environ.get("LOKI_URL", "http://loki:3100")
OUT_PATH = os.environ.get("OUT_PATH", "/out/status.json")
POLL_SECONDS = int(os.environ.get("POLL_SECONDS", "300"))
HTTP_TIMEOUT = float(os.environ.get("HTTP_TIMEOUT", "10"))

# Health: 1/0 now, plus a 7d availability rollup for the (stored) uptime figure.
PROBE_SUCCESS = 'probe_success{job="blackbox-portfolio"}'
UPTIME_7D = 'avg_over_time(probe_success{job="blackbox-portfolio"}[7d]) * 100'

# Unique visitors over 7d — the exact LogQL the Grafana dashboard's "7d" panel uses
# (count distinct remote_addr from the portfolio nginx JSON access logs in Loki).
# Bounded by Loki's 7d retention, which is why we report a 7d window, not all-time.
VISITORS_7D = (
    'count(sum by (remote_addr) (count_over_time('
    '{container="portfolio"} | json remote_addr="remote_addr" | __error__="" [7d])))'
)


def log(msg: str) -> None:
    print(f"{datetime.now(timezone.utc).isoformat()} {msg}", flush=True)


def _scalar(url: str) -> float | None:
    """Run an instant query and return the first sample's value, or None if empty."""
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
        data = json.load(resp)
    result = data.get("data", {}).get("result", [])
    if not result:
        return None
    return float(result[0]["value"][1])


def prom_query(expr: str) -> float | None:
    url = PROM_URL.rstrip("/") + "/api/v1/query?" + urllib.parse.urlencode({"query": expr})
    return _scalar(url)


def loki_query(expr: str) -> float | None:
    url = LOKI_URL.rstrip("/") + "/loki/api/v1/query?" + urllib.parse.urlencode({"query": expr})
    return _scalar(url)


def write_atomic(path: str, payload: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f)
    os.replace(tmp, path)  # atomic — nginx never sees a half-written file


def poll(last: dict) -> dict:
    """One polling pass. Keeps the last good visitor/uptime values on partial failure."""
    status = "degraded"  # default until the probe confirms otherwise

    try:
        probe = prom_query(PROBE_SUCCESS)
        if probe is not None:
            status = "operational" if probe >= 1 else "down"
    except Exception as e:  # noqa: BLE001 — one bad source must not blank the rest
        log(f"probe_success query failed: {e}")

    try:
        uptime = prom_query(UPTIME_7D)
        if uptime is not None:
            last["uptime_7d"] = round(uptime, 2)
    except Exception as e:  # noqa: BLE001
        log(f"uptime query failed: {e}")

    try:
        visitors = loki_query(VISITORS_7D)
        if visitors is not None:
            last["unique_visitors_7d"] = int(visitors)
    except Exception as e:  # noqa: BLE001
        log(f"visitors query failed: {e}")

    return {
        "status": status,
        "uptime_7d": last["uptime_7d"],
        "unique_visitors_7d": last["unique_visitors_7d"],
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }


def main() -> None:
    log(f"status-exporter starting: prom={PROM_URL} loki={LOKI_URL} "
        f"out={OUT_PATH} every {POLL_SECONDS}s")
    last = {"uptime_7d": None, "unique_visitors_7d": None}
    while True:
        try:
            payload = poll(last)
            write_atomic(OUT_PATH, payload)
            log(f"wrote {payload}")
        except Exception as e:  # noqa: BLE001 — keep the loop alive no matter what
            log(f"poll cycle failed: {e}")
        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
