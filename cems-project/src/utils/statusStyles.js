export function normalizeStatus(status) {
  return String(status ?? "pending_hod").toLowerCase();
}

export function getStatusTone(status) {
  const normalized = normalizeStatus(status);
  if (normalized.includes("approved") || normalized.includes("resources_approved")) {
    return "approved";
  }
  if (normalized.includes("rejected")) {
    return "rejected";
  }
  return "pending";
}

export function getStatusBadgeClass(tone) {
  const map = {
    approved: "status-badge--approved",
    rejected: "status-badge--rejected",
    pending: "status-badge--pending",
    info: "status-badge--info",
  };
  return map[tone] ?? map.pending;
}
