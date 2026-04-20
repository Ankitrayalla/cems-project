const SIZE_STYLES = {
	small: 'h-5 w-5 border-2',
	medium: 'h-8 w-8 border-[3px]',
	large: 'h-12 w-12 border-4',
};

function LoadingSpinner({ size = 'medium', text }) {
	const spinnerSize = SIZE_STYLES[size] || SIZE_STYLES.medium;

	return (
		<div className="flex flex-col items-center justify-center gap-2">
			<div
				className={`animate-spin rounded-full border-solid border-blue-600 border-t-transparent ${spinnerSize}`}
				role="status"
				aria-label="Loading"
			/>

			{text ? <p className="text-sm text-gray-600">{text}</p> : null}
		</div>
	);
}

export default LoadingSpinner;
