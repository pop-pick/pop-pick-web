import { type ReactNode, useSyncExternalStore } from "react";

import { buildLoginPath, DEFAULT_NEXT_PATH } from "@/shared/model/login-path";
import { LinkButton } from "@/shared/ui/LinkButton";

import { readStoredNextPath } from "../model/next-path";

const LOGIN_PATH = "/login";

function subscribeNothing() {
	return () => {};
}

function readRetryLoginPath() {
	const storedNextPath = readStoredNextPath();
	return storedNextPath === null ? LOGIN_PATH : buildLoginPath(storedNextPath);
}

function readServerRetryLoginPath() {
	return LOGIN_PATH;
}

interface LoginFailureProps {
	children: ReactNode;
	isCanceled?: boolean;
}

export function LoginFailure({ children, isCanceled = false }: LoginFailureProps) {
	const retryLoginPath = useSyncExternalStore(subscribeNothing, readRetryLoginPath, readServerRetryLoginPath);

	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
			<p role="alert" className="text-b2-16 break-keep text-text-2">
				{children}
			</p>
			<div className="flex w-full flex-col gap-2">
				<LinkButton href={retryLoginPath} replace>
					다시 로그인
				</LinkButton>
				{isCanceled && (
					<LinkButton href={DEFAULT_NEXT_PATH} variant="ghost" replace>
						홈으로
					</LinkButton>
				)}
			</div>
		</main>
	);
}
