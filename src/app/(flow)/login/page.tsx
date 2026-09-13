import { toSafeNextPath } from "@/features/auth/lib/next-path";
import { LoginScreen } from "@/features/auth/LoginScreen";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
	const { next } = await searchParams;
	const requested = typeof next === "string" ? next : null;

	return <LoginScreen next={toSafeNextPath(requested)} />;
}
