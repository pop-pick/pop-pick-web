import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockRouter from "next-router-mock";
import type { ReactElement, ReactNode } from "react";

import { MotionProvider } from "@/shared/providers/MotionProvider";

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
	url?: string;
}

export function renderWithProviders(ui: ReactElement, { url = "/", ...options }: RenderWithProvidersOptions = {}) {
	mockRouter.setCurrentUrl(url);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: Infinity },
			mutations: { retry: false }
		}
	});

	function Providers({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<MotionProvider>{children}</MotionProvider>
			</QueryClientProvider>
		);
	}

	return {
		user: userEvent.setup(),
		queryClient,
		router: mockRouter,
		...render(ui, { wrapper: Providers, ...options })
	};
}
