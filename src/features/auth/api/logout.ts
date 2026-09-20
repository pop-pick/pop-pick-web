import { api } from "@/shared/api/client";

export async function logout(refreshToken: string) {
	await api.post<null>("/api/v1/auth/logout", { json: { refreshToken } });
}
