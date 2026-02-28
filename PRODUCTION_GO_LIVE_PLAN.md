# SUVIDHA — Production Go-Live Plan

## 1) Deployment Strategy
- Strategy: Blue-Green (preferred for instant rollback)
  - Blue: current production
  - Green: new version deployed in parallel
  - Traffic switch via LB/DNS after readiness gate
- Alternative: Canary (10% -> 50% -> 100%) if LB supports weighted routing

## 2) Container Pull Strategy
- Pull immutable images by version tag
- Pre-pull images on Green environment to avoid cold starts
- Verify image digest; store SBOM and signatures when available

## 3) Healthcheck Gate
- Before traffic shift:
  - Backend `/ready` returns 200 for 10 minutes continuously
  - Prometheus scraping without errors
  - SSE connections established and stable for sample clients
  - 0 critical errors in logs during soak period

## 4) Rollback Trigger Conditions
- Any spike in:
  - 5xx error rate > 1% sustained for 5 minutes
  - Response latency p95 > 800 ms for 5 minutes
  - DB connection saturation (>90% pool usage) for 5 minutes
  - SSE disconnect storms or memory growth > 20% in 10 minutes
- Immediate rollback if auth failures or RBAC violations observed

## 5) Pre-Launch Checklist
- Endpoints tested: `/live`, `/ready`, `/metrics`, `/metrics-lite`
- Role-based access verified for admin/dept_admin/staff
- SSE under load (≥50 connections) behaves correctly
- Metrics visible in Prometheus; Grafana dashboards populated
- Logs streaming to centralized sink; JSON structured, requestId present
- Rate limiting verified; expected 429 behavior without side effects
- CORS allowlist correct for production domains
- JWT expiry validated; refresh flow if applicable
- Unauthorized routes tested; 403 toast and page behavior correct

## 6) Launch Day Procedure
- Deployment Order:
  1. Prepare Green infrastructure (DB read replicas if any, Redis, Backend, Frontend)
  2. Run DB migrations (if present) after backup snapshot
  3. Warm Green containers and caches
  4. Run readiness soak (10–15 minutes)
  5. Shift traffic to Green
  6. Monitor, then decommission Blue after validation window
- Live Health Monitoring
  - Watch in Grafana:
    - 5xx rate, 4xx spikes (unexpected), response latency p50/p95/p99
    - DB connection count and wait events
    - SSE connection count and error rates
  - Who Monitors:
    - SRE: infra metrics, LB, container health
    - Backend Eng: API error rates, DB pool, SSE
    - Frontend Eng: client error logs, SSE UI, RBAC behaviors
    - PM/QA: user flows, tickets, analytics dashboards
- Rollback Threshold
  - If rollback conditions met for ≥5 minutes, initiate immediate traffic switch to Blue
  - Notify stakeholders; open incident ticket; capture telemetry and logs

## 7) Post-Launch Validation (First 24 Hours)
- Audit log activity review
- Ticket creation throughput and correctness
- Analytics accuracy cross-checked against DB
- DB load: locks, slow queries, connection pool usage
- Memory usage stability in API containers
- Error log scan (no sensitive data, controlled stack traces)
- SSE stability (connects maintained; reconnection behavior nominal)

## 8) Documentation & Handover
- Update runbooks with observed metrics and thresholds
- Record final image versions and configuration snapshots
- Share known limitations and planned fixes

## Recommended Next Milestone
- CI/CD with automated Blue-Green and Canary support, IaC-managed environments, alerting thresholds codified, SLOs formalized.
