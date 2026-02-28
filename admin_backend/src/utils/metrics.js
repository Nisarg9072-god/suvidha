const client = require("prom-client");
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: "process_" });

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"]
});

const httpRequestDurationMs = new client.Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in ms",
  labelNames: ["method", "route", "status"],
  buckets: [5, 10, 20, 50, 100, 200, 300, 500, 1000, 2000]
});

const activeSseClients = new client.Gauge({
  name: "admin_sse_active_clients",
  help: "Active SSE clients"
});

const dbSlowQueriesTotal = new client.Counter({
  name: "db_slow_queries_total",
  help: "Number of slow DB queries (>300ms)"
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationMs);
register.registerMetric(activeSseClients);
register.registerMetric(dbSlowQueriesTotal);

function markRequest(method, route, status, durationMs) {
  const labels = { method, route, status: String(status) };
  httpRequestsTotal.inc(labels);
  httpRequestDurationMs.observe(labels, durationMs);
}

function setSseClients(n) {
  activeSseClients.set(n);
}

function incSlowQuery() {
  dbSlowQueriesTotal.inc();
}

module.exports = { register, markRequest, setSseClients, incSlowQuery };
