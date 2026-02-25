module.exports = {
  openapi: "3.0.0",
  info: {
    title: "SUVIDHA API",
    version: "1.0.0",
    description:
      "SUVIDHA (Smart Urban Virtual Interactive Digital Helpdesk Assistant) - Hackathon Demo API"
  },
  servers: [{ url: "http://localhost:5000" }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          details: { type: "array", items: { type: "object" } }
        }
      },

      // ---- Auth ----
      RequestOtpBody: {
        type: "object",
        required: ["phone"],
        properties: {
          phone: { type: "string", example: "9000000001" }
        }
      },
      RequestOtpResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "OTP sent (mock)" },
          otp: { type: "string", example: "123456" }
        }
      },
      VerifyOtpBody: {
        type: "object",
        required: ["phone", "otp"],
        properties: {
          phone: { type: "string", example: "9000000001" },
          otp: { type: "string", example: "123456" }
        }
      },
      VerifyOtpResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOi..." },
          user: {
            type: "object",
            properties: {
              id: { type: "integer", example: 2 },
              phone: { type: "string", example: "9000000001" },
              role: { type: "string", example: "citizen" }
            }
          }
        }
      },

      // ---- Tickets ----
      CreateTicketBody: {
        type: "object",
        required: ["title", "description"],
        properties: {
          title: { type: "string", example: "Streetlight not working" },
          description: { type: "string", example: "Light is off since 3 days." }
        }
      },
      Ticket: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          user_id: { type: "integer", example: 2 },
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string", example: "OPEN" },
          created_at: { type: "string", format: "date-time" }
        }
      },

      // ---- Admin status ----
      UpdateStatusBody: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"],
            example: "IN_PROGRESS"
          },
          note: { type: "string", example: "Assigned to field team" }
        }
      },

      // ---- Uploads ----
      Attachment: {
        type: "object",
        properties: {
          id: { type: "integer", example: 10 },
          original_name: { type: "string", example: "proof.pdf" },
          mime_type: { type: "string", example: "application/pdf" },
          size_bytes: { type: "integer", example: 102400 },
          created_at: { type: "string", format: "date-time" }
        }
      },

      // ---- Payments ----
      MockPaymentBody: {
        type: "object",
        required: ["amount", "purpose"],
        properties: {
          amount: { type: "number", example: 199.5 },
          purpose: { type: "string", example: "Water Bill" },
          ticketId: { type: "integer", nullable: true, example: 1 }
        }
      },
      Payment: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          user_id: { type: "integer", example: 2 },
          ticket_id: { type: "integer", nullable: true, example: null },
          amount_paise: { type: "integer", example: 19950 },
          purpose: { type: "string", example: "Water Bill" },
          provider: { type: "string", example: "MOCKPAY" },
          status: { type: "string", example: "PAID" },
          receipt_no: { type: "string", example: "SUVIDHA-20260225-AB12CD34" },
          created_at: { type: "string", format: "date-time" }
        }
      }
    }
  },

  paths: {
    // ---------- Health ----------
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          200: { description: "OK" }
        }
      }
    },

    // ---------- Demo ----------
    "/demo/summary": {
      get: {
        summary: "Demo summary counts",
        responses: {
          200: { description: "Summary JSON" }
        }
      }
    },

    // ---------- Auth ----------
    "/auth/request-otp": {
      post: {
        summary: "Request OTP (mock)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RequestOtpBody" }
            }
          }
        },
        responses: {
          200: {
            description: "OTP issued (mock)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RequestOtpResponse" }
              }
            }
          },
          400: { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },

    "/auth/verify-otp": {
      post: {
        summary: "Verify OTP and get JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyOtpBody" }
            }
          }
        },
        responses: {
          200: {
            description: "JWT issued",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VerifyOtpResponse" }
              }
            }
          },
          401: { description: "Invalid OTP", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },

    // ---------- Tickets ----------
    "/tickets": {
      post: {
        summary: "Create a ticket (complaint)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTicketBody" }
            }
          }
        },
        responses: {
          201: {
            description: "Ticket created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Ticket" } } }
          },
          401: { description: "Unauthorized" }
        }
      },
      get: {
        summary: "List my tickets",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Ticket list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tickets: { type: "array", items: { $ref: "#/components/schemas/Ticket" } }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/tickets/{id}": {
      get: {
        summary: "Get ticket detail (and updates if your API returns them)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Ticket detail" },
          404: { description: "Not found" }
        }
      }
    },

    // ---------- Admin ----------
    "/admin/tickets": {
      get: {
        summary: "Admin: list all tickets",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "All tickets" },
          403: { description: "Forbidden" }
        }
      }
    },

    "/admin/tickets/{id}/status": {
      patch: {
        summary: "Admin: update ticket status (publishes SSE event)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateStatusBody" } }
          }
        },
        responses: {
          200: { description: "Status updated" },
          403: { description: "Forbidden" },
          404: { description: "Not found" }
        }
      }
    },

    // ---------- SSE Stream ----------
    "/stream/tickets/{id}": {
      get: {
        summary: "SSE stream for ticket updates",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "SSE stream (text/event-stream)" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" }
        }
      }
    },

    // ---------- Uploads ----------
    "/tickets/{id}/attachments": {
      post: {
        summary: "Upload attachment to a ticket",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" }
                },
                required: ["file"]
              }
            }
          }
        },
        responses: {
          201: { description: "Attachment uploaded" },
          400: { description: "Bad request" },
          403: { description: "Forbidden" }
        }
      },
      get: {
        summary: "List attachments for a ticket",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "Attachment list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    attachments: { type: "array", items: { $ref: "#/components/schemas/Attachment" } }
                  }
                }
              }
            }
          }
        }
      }
    },

    "/attachments/{attachmentId}/download": {
      get: {
        summary: "Download an attachment",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "attachmentId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "File download" },
          403: { description: "Forbidden" },
          404: { description: "Not found" }
        }
      }
    },

    // ---------- Payments ----------
    "/payments/mock": {
      post: {
        summary: "Create mock payment",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/MockPaymentBody" } }
          }
        },
        responses: {
          201: {
            description: "Payment created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Payment" } } }
          },
          400: { description: "Bad request" }
        }
      }
    },

    "/payments/{id}/receipt.pdf": {
      get: {
        summary: "Download payment receipt PDF",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "PDF receipt" },
          403: { description: "Forbidden" },
          404: { description: "Not found" }
        }
      }
    }
  }
};