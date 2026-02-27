function validateBody(schema) {
  return (req, res, next) => {
    const body = req.body || {};
    if (schema.required) {
      for (const key of schema.required) {
        if (body[key] === undefined || body[key] === null || body[key] === "") {
          return res.status(400).json({ error: { message: `Missing field: ${key}`, code: "VALIDATION_ERROR" } });
        }
      }
    }
    if (schema.enums) {
      for (const [key, allowed] of Object.entries(schema.enums)) {
        if (body[key] !== undefined && !allowed.includes(body[key])) {
          return res.status(400).json({ error: { message: `Invalid value for ${key}`, code: "VALIDATION_ERROR" } });
        }
      }
    }
    return next();
  };
}

module.exports = { validateBody };
