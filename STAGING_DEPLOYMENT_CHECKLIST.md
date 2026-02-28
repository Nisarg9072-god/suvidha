# SUVIDHA — Staging Deployment Checklist

## 1) Staging Infrastructure Requirements
- VM Specs:
  - Frontend Nginx: 2 vCPU, 2 GB RAM, 10 GB storage
  - Backend API: 4 vCPU, 8 GB RAM, 50 GB storage
  - Postgres: 4 vCPU, 8–16 GB RAM (depending on dataset), 200 GB SSD
  - Redis: 1–2 vCPU, 2 GB RAM, minimal storage
- Network:
  - Private network between backend, Postgres, Redis
  - Public access only to Nginx (frontend) and backend (if not behind same reverse proxy)
  - Security groups/firewall: allow HTTPS 443 and SSH (restricted IPs), DB and Redis only internal
- Environment Variables:
  - Backend: JWT_SECRET, CORS_ORIGIN, DATABASE_URL, REDIS_URL, NODE_ENV=production, PORT
  - Frontend: VITE_API_URL (points to backend internal/external hostname)
- Database Staging Clone Strategy:
  - Create logical dump from production (redacted or synthetic data per policy)
  - Restore into staging Postgres
  - Run anonymization scripts if required to protect PII
- Redis Setup:
  - Standalone instance; persistent if backend requires (AOF off or appendonly yes per need)
  - Bind to private network only
- SSL Termination Plan:
  - Use Nginx or managed LB to terminate SSL
  - TLS 1.2+ only, strong ciphers, HSTS enabled
- Reverse Proxy:
  - Nginx or LB routes / to SPA (frontend)
  - Proxy /api/* to backend (if desired)
  - Forward appropriate headers (X-Forwarded-For, X-Forwarded-Proto)

## 2) Staging Deployment Steps
1. Provision VMs and networking (IaaC preferred)
2. Install Docker and docker-compose
3. Set secrets via environment manager (not hardcoded)
4. Bring up stack:
   - `docker compose up -d postgres redis`
   - Initialize DB: restore staging dump
   - `docker compose up -d backend`
   - `docker compose up -d frontend`
5. Configure DNS and SSL certificates
6. Verify health:
   - Backend `/live`, `/ready`
   - Frontend root, SPA routing
7. Enable monitoring scraping and logging sinks

## 3) Validation Checklist
- Frontend loads, routes work (SPA fallback)
- Backend `/ready` returns 200
- RBAC: admin/dept_admin/staff views gated correctly
- 403 toast appears; unauthorized route shows 403 page
- SSE stream connects and updates tickets live
- Analytics and audit logs load and paginate
- Prometheus scrapes `/metrics`, dashboards render
- Log shipping working; JSON structured
- Rate limits, CORS, JWT expiry verified
- No sensitive data in logs
- Build artifacts immutable and cache headers applied

## 4) Rollback Readiness
- DB backup taken prior to changes
- Backend and frontend images tagged with version
- Ability to `docker compose down && docker compose up` with previous tags
- Known-good configuration snapshot saved

## 5) Access Controls
- SSH limited to engineering IPs
- Admin accounts audited in staging
- Secrets stored in vault/parameter store; injected at runtime

## 6) Acceptance Gate
- All checks passed
- Stakeholder sign-off
- Staging stable for 48 hours without critical errors
