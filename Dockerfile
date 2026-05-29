# syntax=docker/dockerfile:1

# ---- install dependencies + source ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# ---- quality gate: lint + typecheck (built by CI via --target test) ----
FROM deps AS test
RUN npm run lint && npm run typecheck

# ---- production build (static site -> /app/build) ----
FROM deps AS build
RUN npm run build

# ---- runtime: nginx serving the prerendered static site ----
# Debian (not alpine) so we can install nginx.org's prebuilt OpenTelemetry dynamic
# module, which emits one span per request to Tempo. Notes baked into the steps below:
#   * The module lives in nginx's OWN apt repo (packages.nginx.org), not Debian's, so we
#     add that repo with its signing key.
#   * The module package carries its own version suffix (e.g. 1.27.4+0.1.2-1~bookworm),
#     so we resolve the build matching this image's ${NGINX_VERSION} instead of hardcoding
#     it — bump the FROM tag and the right module follows automatically.
#   * load_module is a MAIN-context directive and this image's nginx.conf has no
#     modules-enabled include, so we prepend it to /etc/nginx/nginx.conf.
#   * The image has no wget, so the healthcheck uses curl (kept; only gnupg is purged).
FROM nginx:1.27.4-bookworm AS runtime
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends curl gnupg ca-certificates; \
    curl -fsSL https://nginx.org/keys/nginx_signing.key | gpg --dearmor > /usr/share/keyrings/nginx-archive-keyring.gpg; \
    echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/mainline/debian bookworm nginx" > /etc/apt/sources.list.d/nginx.list; \
    apt-get update; \
    otel_ver="$(apt-cache madison nginx-module-otel | awk -v n="${NGINX_VERSION}" '$3 ~ ("^" n "[+]") {print $3; exit}')"; \
    test -n "${otel_ver}"; \
    apt-get install -y --no-install-recommends "nginx-module-otel=${otel_ver}"; \
    sed -i '1i load_module modules/ngx_otel_module.so;' /etc/nginx/nginx.conf; \
    apt-get purge -y --auto-remove gnupg; \
    rm -rf /var/lib/apt/lists/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD curl -fsS http://localhost/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
