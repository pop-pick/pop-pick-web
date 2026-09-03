export type KakaoMapErrorReason = "missing-key" | "script-load-failed" | "not-in-browser";

const MESSAGE: Record<KakaoMapErrorReason, string> = {
	"missing-key":
		"카카오맵 JavaScript 키가 없습니다. NEXT_PUBLIC_KAKAO_MAP_KEY 를 .env.local 에 넣고 개발 서버를 다시 띄우세요. NEXT_PUBLIC_ 환경 변수는 빌드 시점에 번들에 박히므로 서버를 다시 띄우지 않으면 값이 반영되지 않습니다.",
	"script-load-failed":
		"카카오맵 SDK 스크립트를 불러오지 못했습니다. 키 값이 틀렸거나, 지금 접속한 도메인이 카카오 개발자 콘솔에 등록되지 않았거나, 네트워크가 막힌 상태입니다. 개발자 도구 네트워크 탭에서 sdk.js 응답 본문의 errorType 과 message 를 보면 원인이 나옵니다. 도메인은 플랫폼 키 화면의 JavaScript 키 항목에 있는 JavaScript SDK 도메인에 등록하며 로컬 개발 주소도 등록해야 합니다.",
	"not-in-browser":
		"카카오맵 SDK 는 브라우저에서만 동작합니다. 서버에서 loadKakaoMapSdk 를 불렀습니다. use client 컴포넌트의 이펙트 안에서 부르세요."
};

export class KakaoMapError extends Error {
	readonly reason: KakaoMapErrorReason;

	constructor(reason: KakaoMapErrorReason) {
		super(MESSAGE[reason]);
		this.name = "KakaoMapError";
		this.reason = reason;
	}
}
