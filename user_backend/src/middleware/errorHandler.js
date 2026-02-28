module.exports = function errorHandler(err, req, res, next) {
  req.log?.error({ err }, "Unhandled error");
  if (err.message === "Unsupported file type") {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large (max 5MB)" });
  }
  
  const status = err.statusCode || err.status || 500;
  return res.status(status).json({
    error: err.message || "InternalServerError"
  });
};
