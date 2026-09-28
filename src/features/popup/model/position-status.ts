export const POSITION_STATUSES = ["idle", "locating", "granted", "denied", "unavailable"] as const;

export type PositionStatus = (typeof POSITION_STATUSES)[number];

export const POSITION_STATUS_NOTICES: Partial<Record<PositionStatus, string>> = {
	denied: "위치 권한을 거부해 서울 기본 위치를 보여줍니다",
	unavailable: "이 브라우저에서는 현재 위치를 쓸 수 없습니다"
};
