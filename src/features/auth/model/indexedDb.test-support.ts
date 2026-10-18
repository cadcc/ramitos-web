import { vi } from "vitest";

/** Minimal event-driven IndexedDB fixture: overlapping read/write transactions queue. */
export function sessionDatabase() {
	let queue = Promise.resolve();
	const connection = {
		createObjectStore: vi.fn(),
		close: vi.fn(),
		onversionchange: null as (() => void) | null,
		transaction: vi.fn(() => {
			let aborted = false;
			const transaction = {
				error: null,
				oncomplete: null as (() => void) | null,
				onabort: null as (() => void) | null,
				onerror: null as (() => void) | null,
				abort: () => {
					aborted = true;
				},
				objectStore: () => ({
					get: () => {
						const request = { onsuccess: null as (() => void) | null };
						queue = queue.then(() => {
							request.onsuccess?.();
							if (aborted) transaction.onabort?.();
							else transaction.oncomplete?.();
						});
						return request;
					},
				}),
			};
			return transaction;
		}),
	};
	const factory = {
		open: vi.fn(() => {
			const request = {
				result: connection,
				onupgradeneeded: null as (() => void) | null,
				onsuccess: null as (() => void) | null,
				onerror: null as (() => void) | null,
				onblocked: null as (() => void) | null,
			};
			queueMicrotask(() => {
				request.onupgradeneeded?.();
				request.onsuccess?.();
			});
			return request;
		}),
	};
	return { factory: factory as unknown as IDBFactory, connection };
}
