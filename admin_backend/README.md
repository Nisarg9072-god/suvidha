# SUVIDHA Admin Backend — Horizontal Scaling Notes

This service is prepared to run behind a load balancer with multiple instances.

- Liveness: GET /live returns 200 when process is running.
- Readiness: GET /ready returns 200 only if DB is reachable and server is not shutting down; returns 503 during shutdown or DB failure.
- Trust Proxy: app trusts upstream (X-Forwarded-For), enabling proper IP logging.
- Instance Header: All responses include X-Instance-Id for traceability across replicas.
- SSE Capacity: Server enforces ADMIN_SSE_MAX_CLIENTS (default 1000) and rejects new SSE connections with 503 when over capacity.
- Shutdown: Graceful shutdown sets a flag to prevent accepting new SSE clients, closes HTTP, SSE, and DB in order.

Deployment guidance:
- Prefer sticky sessions for SSE when using load balancers to keep streams stable.
- Alternatively (future Phase 13), consider Redis pub/sub to fanout SSE events across replicas.
- Health probes:
  - livenessProbe → GET /live
  - readinessProbe → GET /ready

Environment variables:
- PORT
- DATABASE_URL
- JWT_SECRET
- CORS_ORIGIN (required in production, not "*")
- ADMIN_SSE_MAX_CLIENTS (optional, default 1000)
