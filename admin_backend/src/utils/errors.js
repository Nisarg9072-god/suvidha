class ApiError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode || 500;
    this.code = code || "ERROR";
  }
}

module.exports = { ApiError };
