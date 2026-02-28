const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "SUVIDHA Admin Backend",
    version: "1.0.0"
  },
  tags: [
    { name: "Health" },
    { name: "Admin" },
    { name: "Staff" },
    { name: "Audit" },
    { name: "Analytics" },
    { name: "Auth" },
    { name: "Stream" }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        responses: { "200": { description: "ok" } }
      }
    },
    "/live": {
      get: {
        tags: ["Health"],
        responses: { "200": { description: "ok" } }
      }
    },
    "/ready": {
      get: {
        tags: ["Health"],
        responses: {
          "200": { description: "ready" },
          "503": { description: "not ready" }
        }
      }
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "ok",
            content: {
              "application/json": {
                example: {
                  ok: true,
                  user: { id: 1, role: "admin", department_id: 10 }
                }
              }
            }
          }
        }
      }
    },
    "/admin/ping": {
      get: {
        tags: ["Admin"],
        responses: { "200": { description: "ok" } }
      }
    },
    "/admin/departments": {
      get: {
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        responses: { "200": { description: "ok" } }
      }
    },
    "/admin/staff": {
      get: {
        tags: ["Staff"],
        security: [{ BearerAuth: [] }],
        responses: { "200": { description: "ok" } }
      }
    },
    "/admin/audit": {
      get: {
        tags: ["Audit"],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "actor_id", in: "query", schema: { type: "integer" } },
          { name: "action", in: "query", schema: { type: "string" } },
          { name: "entity_type", in: "query", schema: { type: "string" } },
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } }
        ],
        responses: {
          "200": { description: "ok" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" }
        }
      }
    },
    "/admin/audit/logs": {
      get: {
        tags: ["Audit"],
        security: [{ BearerAuth: [] }],
        description: "Requires permission: AUDIT_VIEW",
        parameters: [
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "actor_id", in: "query", schema: { type: "integer" } },
          { name: "action", in: "query", schema: { type: "string" } },
          { name: "department_id", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 200 } }
        ],
        responses: {
          "200": {
            description: "ok",
            content: {
              "application/json": {
                example: {
                  ok: true,
                  items: [
                    {
                      id: 1,
                      actor_id: 101,
                      actor_role: "admin",
                      action: "ticket_status_changed",
                      entity_type: "ticket",
                      entity_id: 12,
                      department_id: 3,
                      metadata: { fromStatus: "open", toStatus: "in_progress" },
                      ip_address: "127.0.0.1",
                      user_agent: "Mozilla/5.0",
                      created_at: "2026-02-27T12:34:00Z"
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },
    "/admin/tickets": {
      get: {
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 }, description: "Page number (default 1)" },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 }, description: "Items per page (default 20, max 100)" },
          { name: "status", in: "query", schema: { type: "string", enum: ["open","in_progress","resolved","rejected"] } },
          { name: "departmentCode", in: "query", schema: { type: "string", enum: ["GAS","ELEC","MUNI"] } },
          { name: "priority", in: "query", schema: { type: "string", enum: ["LOW","MEDIUM","HIGH","EMERGENCY"] } },
          { name: "area", in: "query", schema: { type: "string" } },
          { name: "assigned_to", in: "query", schema: { type: "integer" } },
          { name: "q", in: "query", schema: { type: "string" } }
        ],
        responses: { "200": { description: "ok" } }
      }
    },
    "/admin/tickets/{id}": {
      get: {
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        responses: { "200": { description: "ok" } }
      }
    },
    "/admin/tickets/{id}/status": {
      patch: {
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        description: "Requires permission: TICKET_STATUS_CHANGE",
        requestBody: {
          content: {
            "application/json": {
              example: { status: "in_progress", reason: "Field inspection scheduled" }
            }
          }
        },
        responses: { "200": { description: "ok" } }
      }
    },
    "/admin/tickets/{id}/assign": {
      patch: {
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        description: "Requires permission: TICKET_ASSIGN",
        requestBody: {
          content: { "application/json": { example: { assigned_to: 123 } } }
        },
        responses: { "200": { description: "ok" } }
      }
    },
    "/admin/tickets/{id}/work-order": {
      post: {
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        description: "Requires permission: TICKET_WORK_ORDER_CREATE",
        requestBody: {
          content: {
            "application/json": {
              example: { title: "Fix leakage", description: "Main line leak at sector 12", due_at: "2026-03-01T10:00:00Z", priority: "HIGH" }
            }
          }
        },
        responses: { "200": { description: "ok" } }
      }
    },
    "/admin/tickets/{id}/updates": {
      get: {
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        description: "Requires authentication",
        responses: { "200": { description: "ok" } }
      },
      post: {
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        description: "Requires permission: TICKET_UPDATE_ADD",
        requestBody: {
          content: {
            "application/json": {
              example: { message: "Technician dispatched", visibility: "internal" }
            }
          }
        },
        responses: { "200": { description: "ok" } }
      }
    },
    "/analytics/overview": {
      get: {
        tags: ["Analytics"],
        security: [{ BearerAuth: [] }],
        description: "Requires permission: ANALYTICS_VIEW",
        parameters: [
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "departmentCode", in: "query", schema: { type: "string", enum: ["GAS","ELEC","MUNI"] } }
        ],
        responses: {
          "200": {
            description: "ok",
            content: {
              "application/json": {
                example: {
                  ok: true,
                  range: { from: "2026-02-01T00:00:00Z", to: "2026-02-27T00:00:00Z" },
                  totals: {
                    tickets_total: 120,
                    open: 30,
                    in_progress: 40,
                    resolved: 45,
                    rejected: 5,
                    emergency_count: 7,
                    sla_breached_count: 9,
                    avg_resolution_hours: 16.4
                  }
                }
              }
            }
          },
          "400": { description: "Validation error" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" }
        }
      }
    },
    "/analytics/areas": {
      get: {
        tags: ["Analytics"],
        security: [{ BearerAuth: [] }],
        description: "Requires permission: ANALYTICS_VIEW",
        parameters: [
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "departmentCode", in: "query", schema: { type: "string", enum: ["GAS","ELEC","MUNI"] } },
          { name: "top", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "status", in: "query", schema: { type: "string", enum: ["open","in_progress","resolved","rejected"] } }
        ],
        responses: {
          "200": {
            description: "ok",
            content: {
              "application/json": {
                example: {
                  ok: true,
                  items: [
                    { area: "Sector 12", total: 20, open: 5, in_progress: 8, resolved: 6, rejected: 1, emergency_count: 2 }
                  ]
                }
              }
            }
          }
        }
      }
    },
    "/analytics/hotspots": {
      get: {
        tags: ["Analytics"],
        security: [{ BearerAuth: [] }],
        description: "Requires permission: ANALYTICS_VIEW",
        parameters: [
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "departmentCode", in: "query", schema: { type: "string", enum: ["GAS","ELEC","MUNI"] } },
          { name: "top", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "status", in: "query", schema: { type: "string", enum: ["open","in_progress","resolved","rejected"] } }
        ],
        responses: {
          "200": {
            description: "ok",
            content: {
              "application/json": {
                example: {
                  ok: true,
                  items: [
                    { lat_bucket: 28.61, lng_bucket: 77.21, count: 5, top_area: "Sector 7", top_departmentCode: "GAS", sample_ticket_id: 123 }
                  ]
                }
              }
            }
          }
        }
      }
    },
    "/stream/admin/tickets": {
      get: {
        tags: ["Stream"],
        security: [{ BearerAuth: [] }],
        description: "SSE stream of admin ticket events",
        responses: {
          "200": { description: "SSE stream" }
        }
      }
    },
    "/metrics-lite": {
      get: {
        tags: ["Health"],
        security: [{ BearerAuth: [] }],
        description: "Operational metrics (admin only)",
        responses: {
          "200": {
            description: "ok",
            content: {
              "application/json": {
                example: {
                  ok: true,
                  service: "admin_backend",
                  requestId: "abc-123",
                  uptimeSec: 1234,
                  memory: { rss: 12345678, heapUsed: 9876543, heapTotal: 12345678 },
                  activeSseClients: 2,
                  nodeVersion: "v18.20.8"
                }
              }
            }
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" }
        }
      }
    },
    "/metrics": {
      get: {
        tags: ["Health"],
        security: [{ BearerAuth: [] }],
        description: "Prometheus metrics (admin only)",
        responses: {
          "200": { description: "text/plain Prometheus format" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
