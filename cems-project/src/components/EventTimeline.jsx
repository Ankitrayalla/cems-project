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

  const completedSteps = steps.filter((s) => s.done || s.rejected).length;
  const progressPercent = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="event-timeline" aria-label="Event progress timeline">
      <div
        className="timeline-progress"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Approval progress ${progressPercent}%`}
      >
        <div
          className="timeline-progress-bar"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="timeline-steps timeline-steps--horizontal">
        {steps.map((step) => {
          const stateClass = step.rejected
            ? "rejected"
            : step.done
              ? "done"
              : "pending";

          const icon = step.rejected ? "✕" : step.done ? "✓" : "○";

          return (
            <div key={step.key} className={`timeline-step ${stateClass}`}>
              <span className="timeline-dot" aria-hidden="true">
                {icon}
              </span>
              <span className="timeline-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventTimeline;
