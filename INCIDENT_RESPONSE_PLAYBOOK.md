# SUVIDHA — Incident Response Playbook

## Escalation Ladder
- Sev-1 (Production outage/security): On-call SRE -> Backend Lead -> CTO
- Sev-2 (Degraded service): On-call SRE -> Backend Lead -> PM
- Sev-3 (Minor bug): On-call SRE -> Engineer -> Ticket to backlog

## 1) Backend Crashes
- Symptoms: `/live` fails, 5xx spikes
- Immediate Actions:
  - Check container logs; capture last 1000 lines
  - Verify memory and CPU; restart container if resource starved
  - Validate JWT_SECRET present; CORS_ORIGIN correct
  - If persistent, rollback to last known-good image (Blue)
- Communication: Post status to incident channel; ETA updates every 15 minutes

## 2) DB Overloads
- Symptoms: High connection count, slow queries, timeouts
- Immediate Actions:
  - Raise connection pool size cautiously; check long-running queries
  - Enable slow query logging; kill offenders if necessary
  - Scale vertically or add read replicas for analytics
  - Apply rate limiting where necessary
- Post-Mortem: Index review, query optimization, caching strategy

## 3) Redis Fails
- Symptoms: Cache misses, request latency spikes
- Immediate Actions:
  - Restart Redis; verify persistence as configured
  - Failover to backup instance if available
  - Reduce cache dependency; ensure API degrades gracefully
- Follow-up: Add Redis health alerts; consider clustering

## 4) Metrics Endpoint Fails
- Symptoms: Prometheus scrape errors, dashboards blank
- Immediate Actions:
  - Validate `/metrics` route and auth (admin-only)
  - Check exporter dependencies
  - Temporarily rely on `/metrics-lite` if available
- Follow-up: Add redundancy for metrics exporter

## 5) SSE Floods Memory
- Symptoms: Growing memory use, frequent GC, OOM kills
- Immediate Actions:
  - Cap SSE connections; throttle event emission
  - Restart affected pods; shift traffic
  - Inspect reconnection loops; enforce backoff
- Long-term: Implement connection limits per IP; shard streams

## 6) JWT Secret Misconfigured
- Symptoms: Widespread auth failures (401)
- Immediate Actions:
  - Validate environment; rotate secret if leaked
  - If urgent, rollback to previous environment config
  - Notify stakeholders; force re-login only if required

## 7) CORS Misconfigured
- Symptoms: Browser CORS errors
- Immediate Actions:
  - Update allowlist to correct domains; avoid wildcard
  - Validate preflight responses and headers
  - Rollback config if blocking user flows

## Communications
- Status Page: Update for Sev-1/2 incidents
- Internal: Dedicated incident Slack/Teams room
- External: Template communication for affected users if Sev-1

## Resolution & Post-Mortem
- Collect logs, metrics, timelines
- Identify root cause, contributing factors
- Action items with owners and deadlines
- Update runbooks and dashboards
