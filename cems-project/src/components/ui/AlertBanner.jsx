function AlertBanner({ variant = "error", children }) {
  return (
    <div className={`alert-banner alert-banner--${variant}`} role="alert">
      <p>{children}</p>
    </div>
  );
}

export default AlertBanner;
