"use client";

import type { ReactNode } from "react";

import { type AuthStatus, useAuthStore } from "../model/useAuthStore";

interface AuthStatusSwitchProps {
	views: Partial<Record<AuthStatus, ReactNode>>;
}

export function AuthStatusSwitch({ views }: AuthStatusSwitchProps) {
	const status = useAuthStore((state) => state.status);

	return <>{views[status]}</>;
}
