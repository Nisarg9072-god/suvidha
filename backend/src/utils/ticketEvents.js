const subscribersByTicketId = new Map();

function addSubscriber(ticketId, res) {
  const key = String(ticketId);
  if (!subscribersByTicketId.has(key)) subscribersByTicketId.set(key, new Set());
  subscribersByTicketId.get(key).add(res);
}

function removeSubscriber(ticketId, res) {
  const key = String(ticketId);
  const set = subscribersByTicketId.get(key);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) subscribersByTicketId.delete(key);
}

function publish(ticketId, event, data) {
  const key = String(ticketId);
  const set = subscribersByTicketId.get(key);
  if (!set) return;
  const payload = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    try { res.write(payload); } catch (_) {}
  }
}

module.exports = { addSubscriber, removeSubscriber, publish };
