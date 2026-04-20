const VARIANT_STYLES = {
	primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
	secondary:
		'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500',
	danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
};

function Button({
	children,
	onClick,
	variant = 'primary',
	disabled = false,
}) {
	const selectedVariant = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;

	const baseStyles =
		'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

	const disabledStyles = 'cursor-not-allowed bg-gray-300 text-gray-600 opacity-80';

	const className = disabled
		? `${baseStyles} ${disabledStyles}`
		: `${baseStyles} ${selectedVariant}`;

	return (
		<button type="button" onClick={onClick} disabled={disabled} className={className}>
			{children}
		</button>
	);
}

export default Button;
