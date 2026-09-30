import { LoginScreen } from "@/features/auth/components/LoginScreen";
import { sanitizeNextPath } from "@/shared/model/login-path";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
	const { next } = await searchParams;
	const requestedNext = typeof next === "string" ? next : null;

	return <LoginScreen nextPath={sanitizeNextPath(requestedNext)} />;
}
