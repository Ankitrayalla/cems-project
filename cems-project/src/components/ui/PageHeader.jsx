function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header__copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="dashboard-header__action">{action}</div> : null}
    </header>
  );
}

export default PageHeader;
