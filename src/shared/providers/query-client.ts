import { environmentManager, QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/shared/api/errors";

const STALE_TIME_MS = 30_000;
const MAX_RETRY_COUNT = 2;

function isClientError(error: unknown) {
	return error instanceof ApiError && error.kind === "http" && error.status >= 400 && error.status < 500;
}

function shouldRetry(failureCount: number, error: unknown) {
	if (isClientError(error) || environmentManager.isServer()) {
		return false;
	}

	return failureCount < MAX_RETRY_COUNT;
}

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: STALE_TIME_MS,
				retry: shouldRetry
			}
		}
	});
}
