const SUPPORTED_TYPES = new Set(["text", "email", "password", "number", "date"]);

function Input({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error,
}) {
  const inputType = SUPPORTED_TYPES.has(type) ? type : "text";
  const inputId = label
    ? `input-${label.toLowerCase().trim().replace(/\s+/g, "-")}`
    : undefined;

  return (
    <div className="form-field">
      {label ? <label htmlFor={inputId}>{label}</label> : null}

      <input
        id={inputId}
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
      />

      {error ? (
        <p id={inputId ? `${inputId}-error` : undefined} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
