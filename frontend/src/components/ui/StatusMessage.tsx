type StatusMessageProps = {
	isLoading: boolean,
	errorMsg: string | null,
	loadingText: string
};

// Shared loading/error placeholder for pages that fetch data
export function StatusMessage({ isLoading, errorMsg, loadingText }: StatusMessageProps) {

	return (
		<section>
			{isLoading
				? <p className="text-purple-300">{loadingText}</p>
				: <div className="stat-card">{errorMsg}</div>}
		</section>
	);
}

export default StatusMessage;
