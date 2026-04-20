function Card({ children, title, footer }) {
	const hasHeader = Boolean(title);
	const hasFooter = Boolean(footer);

	return (
		<article className="overflow-hidden rounded-xl bg-white shadow-md">
			{hasHeader ? (
				<header className="border-b border-gray-200 px-6 py-4">
					<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
				</header>
			) : null}

			<div className="px-6 py-5">{children}</div>

			{hasFooter ? (
				<footer className="border-t border-gray-200 px-6 py-4 text-sm text-gray-600">
					{footer}
				</footer>
			) : null}
		</article>
	);
}

export default Card;
