import { useEffect, useState } from "react";

// Runs a loader whenever `key` changes and tracks data/error/loading state.
// The cancelled flag stops state updates after unmount or when the key changes mid-request.
export function useAsyncData<T>(loader: () => Promise<T>, fallbackError: string, key: unknown) {

	const [data, setData] = useState<T | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		let cancelled = false;

		loader()
			.then(result => { if (!cancelled) setData(result); })
			.catch(error => {
				if (!cancelled) setErrorMsg(error instanceof Error ? error.message : fallbackError);
			})
			.finally(() => { if (!cancelled) setIsLoading(false); });

		return () => { cancelled = true; };
		// loader is recreated every render, so only the key should retrigger the fetch
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);

	return { data, setData, errorMsg, isLoading };
}
