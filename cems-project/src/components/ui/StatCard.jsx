function StatCard({ label, value, variant = "default", index = 0, animate = true }) {
  const style = animate ? { "--stat-delay": `${index * 70}ms` } : undefined;

  return (
    <div
      className={`stat-card stat-card--${variant}${animate ? " stat-card--animate" : ""}`}
      style={style}
    >
      <p className="stat-card-label">{label}</p>
      <p className="stat-card-value">{value}</p>
    </div>
  );
}

export default StatCard;
