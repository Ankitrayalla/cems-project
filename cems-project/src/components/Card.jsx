function Card({ children, title, footer, className = "" }) {
  const hasHeader = Boolean(title);
  const hasFooter = Boolean(footer);

  return (
    <article className={`ui-card ${className}`.trim()}>
      {hasHeader ? (
        <header className="ui-card-header">
          <h3>{title}</h3>
        </header>
      ) : null}

      <div className="ui-card-body">{children}</div>

      {hasFooter ? <footer className="ui-card-footer">{footer}</footer> : null}
    </article>
  );
}

export default Card;
