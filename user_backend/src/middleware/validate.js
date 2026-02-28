module.exports = function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });
    if (!result.success) {
      return res.status(400).json({
        error: "ValidationError",
        details: result.error.issues.map(i => ({
          path: i.path,
          message: i.message
        }))
      });
    }
    next();
  };
};
