function line(level, msg, meta) {
  const ts = new Date().toISOString();
  const payload = { ts, level, msg };
  if (meta && typeof meta === "object") {
    for (const [k, v] of Object.entries(meta)) {
      payload[k] = v;
    }
  }
  return JSON.stringify(payload);
}

const logger = {
  info: (msg, meta) => console.log(line("info", msg, meta)),
  error: (msg, meta) => console.error(line("error", msg, meta)),
  warn: (msg, meta) => console.warn(line("warn", msg, meta))
};

module.exports = logger;
