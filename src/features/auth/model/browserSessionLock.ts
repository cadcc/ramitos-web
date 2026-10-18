let database: Promise<IDBDatabase> | undefined;

function openDatabase() {
	if (!database) {
		database = new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("ramitos-session-lock", 1);
			request.onupgradeneeded = () => {
				request.result.createObjectStore("mutex");
			};
			request.onerror = () =>
				reject(
					new Error(
						request.error?.message ?? "Session coordination could not open",
					),
				);
			request.onblocked = () =>
				reject(new Error("Session coordination is blocked"));
			request.onsuccess = () => {
				const connection = request.result;
				connection.onversionchange = () => {
					connection.close();
					database = undefined;
				};
				resolve(connection);
			};
		}).catch((error: unknown) => {
			database = undefined;
			throw error;
		});
	}
	return database;
}

/** Serialize synchronous session changes across tabs, including browsers without Web Locks. */
export async function browserSessionExclusive<T>(work: () => T): Promise<T> {
	if (navigator.locks?.request)
		return navigator.locks.request("ramitos-session", work);

	// IndexedDB read/write transactions on one store are exclusive across tabs.
	// Run the localStorage comparison and write inside an active transaction.
	// No credentials are stored in this coordination database.
	const connection = await openDatabase();
	return new Promise<T>((resolve, reject) => {
		const transaction = connection.transaction("mutex", "readwrite");
		let result: T;
		transaction.oncomplete = () => resolve(result);
		transaction.onabort = () =>
			reject(
				transaction.error ?? new Error("Session coordination was cancelled"),
			);
		transaction.onerror = () =>
			reject(
				new Error(transaction.error?.message ?? "Session coordination failed"),
			);
		const request = transaction.objectStore("mutex").get("session");
		request.onsuccess = () => {
			try {
				result = work();
			} catch (error) {
				reject(
					error instanceof Error ? error : new Error("Session change failed"),
				);
				transaction.abort();
			}
		};
	});
}
