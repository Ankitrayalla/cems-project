const VARIANT_CLASS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  success: "btn-success",
  info: "btn-info",
  ghost: "btn-ghost",
};

function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  size,
  className = "",
}) {
  const variantClass = VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary;
  const sizeClass = size === "sm" ? "btn-sm" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export default Button;
