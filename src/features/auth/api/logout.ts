import { api } from "@/shared/api/client";

export async function logout(accessToken: string | null) {
	await api.delete<null>("/api/auth/session", { auth: false, accessToken: accessToken ?? undefined });
}
