import { getTimelineStatus } from "../utils/timelineStatus";

function EventTimeline({ event }) {
  const timeline = getTimelineStatus(event);

  const steps = [
    { key: "submitted", label: "Submitted", done: timeline.submitted, rejected: false },
    {
      key: "hodApproved",
      label: timeline.hodRejected ? "HOD Rejected" : "HOD Approved",
      done: timeline.hodApproved,
      rejected: timeline.hodRejected,
    },
    {
      key: "principalApproved",
      label: timeline.principalRejected ? "Principal Rejected" : "Principal Approved",
      done: timeline.principalApproved,
      rejected: timeline.principalRejected,
    },
    {
      key: "resources",
      label: timeline.resourcesRejected ? "Resources Rejected" : "Resources Approved",
      done: timeline.resourcesApproved,
      rejected: timeline.resourcesRejected,
    },
  ];

  return (
    <div className="event-timeline" aria-label="Event progress timeline">
      {steps.map((step) => (
        <div
          key={step.key}
          className={`timeline-step ${step.done ? "done" : "pending"} ${step.rejected ? "rejected" : ""}`.trim()}
        >
          <span className="timeline-icon" aria-hidden="true">
            {step.rejected ? "❌" : step.done ? "✔" : "•"}
          </span>
          <span className="timeline-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
}

export default EventTimeline;