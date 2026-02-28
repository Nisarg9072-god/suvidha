let isShuttingDown = false;
let instanceId = null;

function setShuttingDown(v) {
  isShuttingDown = !!v;
}

function getShuttingDown() {
  return isShuttingDown;
}

function setInstanceId(id) {
  instanceId = id;
}

function getInstanceId() {
  return instanceId || "unknown";
}

module.exports = { setShuttingDown, getShuttingDown, setInstanceId, getInstanceId };
