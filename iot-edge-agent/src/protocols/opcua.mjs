/** OPC UA subscription stub: maps nodeId → value, no live stack in L1. */

export function encodeDataValue(nodeId, value, sourceTs = new Date()) {
  return { nodeId, value, statusCode: "Good", sourceTimestamp: sourceTs.toISOString() };
}

export function applySubscriptions(nodes, notifications) {
  const wanted = new Set(nodes);
  return notifications.filter((n) => wanted.has(n.nodeId));
}
