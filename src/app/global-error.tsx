"use client";

interface GlobalErrorProps {
	error: Error & { digest?: string };
	retry: () => void;
}

export default function GlobalError({ retry }: GlobalErrorProps) {
	return (
		<html lang="ko">
			<body>
				<h1>화면을 열지 못했어요</h1>
				<p>잠시 뒤 다시 시도해 주세요.</p>
				<button type="button" onClick={retry}>
					다시 시도
				</button>
			</body>
		</html>
	);
}
