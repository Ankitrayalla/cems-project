const SUPPORTED_TYPES = new Set(['text', 'email', 'password', 'number', 'date']);

function Input({
	label,
	type = 'text',
	placeholder = '',
	value,
	onChange,
	error,
}) {
	const inputType = SUPPORTED_TYPES.has(type) ? type : 'text';
	const inputId = label
		? `input-${label.toLowerCase().trim().replace(/\s+/g, '-')}`
		: undefined;

	return (
		<div className="w-full">
			{label ? (
				<label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
					{label}
				</label>
			) : null}

			<input
				id={inputId}
				type={inputType}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				aria-invalid={Boolean(error)}
				aria-describedby={error && inputId ? `${inputId}-error` : undefined}
				className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
					error
						? 'border-red-500 focus:border-red-500'
						: 'border-gray-300 focus:border-blue-500'
				}`}
			/>

			{error ? (
				<p id={inputId ? `${inputId}-error` : undefined} className="mt-1 text-sm text-red-600">
					{error}
				</p>
			) : null}
		</div>
	);
}

export default Input;
