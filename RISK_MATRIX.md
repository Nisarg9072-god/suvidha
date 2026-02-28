# SUVIDHA — Risk Matrix

## Summary
- Final Risk Level: Medium
- Rationale: System is production-ready with RBAC, SSE, metrics, and healthchecks. Remaining risks are mostly operational (scaling, monitoring tuning, and backend image/process validation).

## Risk Categories

### Security
- Likelihood: Low | Impact: High
- Controls: JWT, RBAC, rate limits, CORS allowlist, Helmet/CSP
- Mitigation: Regular secret rotation, audit of admin endpoints, penetration tests

### Availability
- Likelihood: Medium | Impact: High
- Controls: Healthchecks, graceful shutdown, SSE backoff, load tests planned
- Mitigation: Blue-Green/Canary, rolling restarts, autoscaling rules

### Performance
- Likelihood: Medium | Impact: Medium
- Controls: Request latency metrics, slow query counters, SSE count metrics
- Mitigation: DB indexing, Redis caching strategy, CDNs for static assets

### Observability
- Likelihood: Medium | Impact: Medium
- Controls: Prometheus/Grafana, structured logs, requestId
- Mitigation: Alert thresholds, log shipping redundancy, runbook updates

### Operational
- Likelihood: Medium | Impact: Medium
- Controls: Dockerized deployment, compose orchestration
- Mitigation: CI/CD, IaC, image signing, backup/restore drills

## Roadmap Priorities (Mitigations)
- Implement CI/CD with Blue-Green and Canary built-in
- Add alerting thresholds and SLOs for latency and error rates
- Introduce CDN for frontend static assets and caching strategy
- Consider Redis clustering and DB read replicas for analytics
- Centralize logging (ELK/Loki) with retention and search

## Acceptance
- Proceed to staging and controlled go-live with monitoring and rollback plan
