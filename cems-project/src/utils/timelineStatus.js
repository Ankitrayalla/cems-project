export function getTimelineStatus(event) {
  const status = String(event?.status ?? "pending_hod").toLowerCase();

  return {
    submitted: true,
    hodApproved: ["approved_hod", "approved_principal", "rejected_principal", "resources_approved", "resources_rejected"].includes(status),
    hodRejected: status === "rejected_hod",
    principalApproved: ["approved_principal", "resources_approved", "resources_rejected"].includes(status),
    principalRejected: status === "rejected_principal",
    resourcesApproved: status === "resources_approved",
    resourcesRejected: status === "resources_rejected",
  };
}
