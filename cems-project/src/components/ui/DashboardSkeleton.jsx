function DashboardSkeleton({ showStats = true, cards = 3 }) {
  return (
    <div className="dashboard-skeleton" aria-hidden="true">
      {showStats ? (
        <div className="stats-grid">
          <div className="skeleton-stat" />
          <div className="skeleton-stat" />
          <div className="skeleton-stat" />
        </div>
      ) : null}

      <div className="skeleton-section-title" />

      <div className="proposal-grid">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    </div>
  );
}

export default DashboardSkeleton;
