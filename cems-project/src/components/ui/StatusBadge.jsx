import { getStatusBadgeClass, getStatusTone } from "../../utils/statusStyles";

function StatusBadge({ status, label, tone: toneOverride }) {
  const tone = toneOverride ?? getStatusTone(status);
  const badgeClass = getStatusBadgeClass(tone);

  return (
    <span className={`status-badge ${badgeClass}`}>
      {label ?? status}
    </span>
  );
}

export default StatusBadge;
