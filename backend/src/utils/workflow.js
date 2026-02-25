const allowedStatuses = new Set(["open", "in_progress", "resolved", "rejected"]);

function canTransition(from, to) {
  if (!allowedStatuses.has(from) || !allowedStatuses.has(to)) return false;
  if (from === to) return true;

  if (from === "open") return to === "in_progress" || to === "rejected";
  if (from === "in_progress") return to === "resolved" || to === "rejected";
  if (from === "resolved") return false;
  if (from === "rejected") return false;
  return false;
}

module.exports = { allowedStatuses, canTransition };

