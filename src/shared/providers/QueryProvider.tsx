"use client";

import { environmentManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

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

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: STALE_TIME_MS,
				retry: shouldRetry
			}
		}
	});
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
	if (environmentManager.isServer()) {
		return makeQueryClient();
	}

	return (browserQueryClient ??= makeQueryClient());
}

interface QueryProviderProps {
	children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
