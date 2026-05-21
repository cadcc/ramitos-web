import { useEffect, useState } from "react";

export function usePersistentRoadmapState<T>(
	key: string,
	initialValue: T,
	sanitize?: (value: unknown) => T,
) {
	const [value, setValue] = useState<T>(() => {
		try {
			const stored = localStorage.getItem(key);
			if (!stored) return initialValue;
			const parsed = JSON.parse(stored) as unknown;
			return sanitize ? sanitize(parsed) : (parsed as T);
		} catch {
			return initialValue;
		}
	});

	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	return [value, setValue] as const;
}
