const SIZE_CLASS = {
  small: "spinner--sm",
  medium: "",
  large: "spinner--lg",
};

function LoadingSpinner({ size = "medium", text, variant = "panel" }) {
  const sizeClass = SIZE_CLASS[size] ?? "";

  if (variant === "inline") {
    return (
      <span className="loading-inline" role="status" aria-live="polite">
        <span className={`spinner spinner--inline ${sizeClass}`.trim()} aria-hidden="true" />
        {text ? <span className="loading-inline-text">{text}</span> : null}
      </span>
    );
  }

  return (
    <div className={`loading-state loading-state--${variant}`} role="status" aria-live="polite">
      <div className={`spinner ${sizeClass}`.trim()} aria-label="Loading" />
      {text ? <p className="loading-text">{text}</p> : null}
    </div>
  );
}

export default LoadingSpinner;
