import { LoginComplete } from "@/features/auth/components/LoginComplete";
import { sanitizeNextPath } from "@/features/auth/model/next-path";

export default async function LoginCompletePage({ searchParams }: PageProps<"/login/complete">) {
	const { next } = await searchParams;
	const requestedNext = typeof next === "string" ? next : null;

	return <LoginComplete next={sanitizeNextPath(requestedNext)} />;
}
