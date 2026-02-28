const store = new Map();

function now() {
  return Date.now();
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

function set(key, value, ttlMs) {
  const expiresAt = now() + Math.max(ttlMs || 0, 0);
  store.set(key, { value, expiresAt });
}

function cleanup() {
  const t = now();
  for (const [k, v] of store.entries()) {
    if (v.expiresAt <= t) store.delete(k);
  }
}

setInterval(() => {
  try { cleanup(); } catch (e) {}
}, 10000).unref?.();

module.exports = { get, set };
