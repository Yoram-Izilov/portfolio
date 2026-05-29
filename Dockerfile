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
FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
