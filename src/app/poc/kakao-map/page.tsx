"use client";

import { useEffect, useState } from "react";

import type { KakaoMarkerData } from "@/shared/lib/kakao-map";
import { KakaoMap, useKakaoMapHandle } from "@/shared/lib/kakao-map";
import { Button } from "@/shared/ui/Button";

const SEONGSU_POSITION = { lat: 37.5447, lng: 127.0557 };
const HONGDAE_POSITION = { lat: 37.5563, lng: 126.9236 };

const MARKER_POOL: readonly KakaoMarkerData[] = [
	{ id: "seongsu", position: SEONGSU_POSITION, title: "성수" },
	{ id: "hongdae", position: HONGDAE_POSITION, title: "홍대" },
	{ id: "apgujeong", position: { lat: 37.5271, lng: 127.0286 }, title: "압구정" },
	{ id: "jamsil", position: { lat: 37.5133, lng: 127.1 }, title: "잠실" }
];

const CENTER_PRESETS = [
	{ id: "seongsu", label: "성수로 이동", position: SEONGSU_POSITION },
	{ id: "hongdae", label: "홍대로 이동", position: HONGDAE_POSITION }
] as const;

type CenterPreset = (typeof CENTER_PRESETS)[number];

const MIN_LEVEL = 1;
const MAX_LEVEL = 14;

function MapViewportReadout() {
	const handle = useKakaoMapHandle();
	const [readout, setReadout] = useState<string | null>(null);

	useEffect(() => {
		if (handle === null) {
			return;
		}

		const { sdk, map } = handle;

		const read = () => {
			const center = map.getCenter();
			setReadout(`중심 ${center.getLat().toFixed(5)}, ${center.getLng().toFixed(5)} / 확대 수준 ${map.getLevel()}`);
		};

		read();
		sdk.maps.event.addListener(map, "idle", read);

		return () => {
			sdk.maps.event.removeListener(map, "idle", read);
		};
	}, [handle]);

	if (readout === null) {
		return null;
	}

	return (
		<p className="absolute bottom-2 left-2 z-10 rounded-lg bg-white/90 px-3 py-1 text-xs text-zinc-700">{readout}</p>
	);
}

export default function PocKakaoMapPage() {
	const [markerCount, setMarkerCount] = useState(3);
	const [preset, setPreset] = useState<CenterPreset>(CENTER_PRESETS[0]);
	const [level, setLevel] = useState(5);
	const [isTall, setIsTall] = useState(true);
	const [clickLog, setClickLog] = useState<readonly string[]>([]);

	const markers = MARKER_POOL.slice(0, markerCount);

	return (
		<main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
			<header className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">카카오맵 코어 모듈 PoC</h1>
				<p className="text-sm text-zinc-600">
					기획과 시안 전에 코어 모듈만 확인하는 임시 페이지입니다. 지도 렌더와 마커, 이벤트, 컨테이너 크기 변화, 키보드
					조작, 실패 표면을 여기서 봅니다.
				</p>
			</header>

			<KakaoMap
				center={preset.position}
				level={level}
				markers={markers}
				onMarkerClick={(markerId) => {
					setClickLog((previous) => [...previous, markerId]);
				}}
				label="팝업 위치를 보여주는 지도"
				className={isTall ? "h-96" : "h-64"}
			>
				<MapViewportReadout />
			</KakaoMap>

			<section className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold">지도 조작</h2>
				<div className="flex flex-wrap gap-2">
					{CENTER_PRESETS.map((candidate) => (
						<Button
							key={candidate.id}
							variant={candidate.id === preset.id ? "primary" : "secondary"}
							onClick={() => {
								setPreset(candidate);
							}}
						>
							{candidate.label}
						</Button>
					))}
					<Button
						variant="secondary"
						onClick={() => {
							setLevel((previous) => Math.max(MIN_LEVEL, previous - 1));
						}}
					>
						확대
					</Button>
					<Button
						variant="secondary"
						onClick={() => {
							setLevel((previous) => Math.min(MAX_LEVEL, previous + 1));
						}}
					>
						축소
					</Button>
				</div>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold">마커 {markers.length}개</h2>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="secondary"
						disabled={markerCount >= MARKER_POOL.length}
						onClick={() => {
							setMarkerCount((previous) => Math.min(MARKER_POOL.length, previous + 1));
						}}
					>
						마커 추가
					</Button>
					<Button
						variant="secondary"
						disabled={markerCount <= 0}
						onClick={() => {
							setMarkerCount((previous) => Math.max(0, previous - 1));
						}}
					>
						마커 제거
					</Button>
				</div>
				<p className="text-sm text-zinc-600">
					마커를 클릭하면 아래에 id 가 쌓입니다. 한 번 클릭에 한 줄만 늘어야 합니다. 두 줄씩 늘면 리스너가 두 번 붙은
					것입니다.
				</p>
				<ul className="flex flex-col gap-1 text-sm">
					{clickLog.length === 0 ? <li className="text-zinc-500">아직 클릭 기록이 없습니다.</li> : null}
					{clickLog.map((markerId, index) => (
						<li key={`${markerId}-${String(index)}`} className="font-mono text-zinc-800">
							{index + 1}. {markerId}
						</li>
					))}
				</ul>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold">컨테이너 크기와 키보드</h2>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="secondary"
						onClick={() => {
							setIsTall((previous) => !previous);
						}}
					>
						높이 바꾸기 ({isTall ? "h-96" : "h-64"})
					</Button>
				</div>
				<p className="text-sm text-zinc-600">
					높이를 바꿀 때 회색 띠가 남지 않아야 합니다. 위 표시의 중심 좌표가 함께 움직이면 relayout 뒤에 중심을 되돌리는
					코드가 필요합니다. 지도에 Tab 으로 포커스를 주고 방향키와 더하기, 빼기 키로 움직이는지도 확인합니다.
				</p>
			</section>
		</main>
	);
}
