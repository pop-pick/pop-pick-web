import type { NextConfig } from "next";

function resolveApiBaseUrl(value: string | undefined) {
	if (!value) {
		throw new Error(
			"API_BASE_URL이 비어 있다. 백엔드 API 주소를 로컬은 .env.local에, 배포는 Vercel 프로젝트 환경 변수에 넣는다"
		);
	}
	new URL(value);
	return value.replace(/\/+$/, "");
}

const apiBaseUrl = resolveApiBaseUrl(process.env.API_BASE_URL);

const nextConfig: NextConfig = {
	cacheComponents: false,
	reactCompiler: true,
	poweredByHeader: false,
	agentRules: false,
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					{ key: "X-Frame-Options", value: "SAMEORIGIN" },
					{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" }
				]
			}
		];
	},
	rewrites() {
		return [{ source: "/api/v1/:path*", destination: `${apiBaseUrl}/api/v1/:path*` }];
	}
};

export default nextConfig;
