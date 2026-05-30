# syntax=docker/dockerfile:1

# Tiny dependency-free sidecar: polls Prometheus + Loki on the monitoring network and
# writes a curated status.json to the shared `status` volume. stdlib only - no pip.
FROM python:3.13-alpine

WORKDIR /app
COPY exporter.py .

# Run unprivileged. /out is the shared volume mount point; owning it in the image means
# a freshly created named volume inherits this ownership, so the writes succeed.
RUN adduser -D -u 10001 exporter && mkdir -p /out && chown exporter:exporter /out
USER exporter

CMD ["python", "-u", "exporter.py"]
