import { preconnect } from "react-dom";

const KAKAO_MAP_ORIGINS = ["https://dapi.kakao.com", "https://t1.daumcdn.net", "https://mts.daumcdn.net"];

export default function ExploreLayout({ children, sheet }: LayoutProps<"/explore">) {
	KAKAO_MAP_ORIGINS.forEach((origin) => preconnect(origin));

	return (
		<>
			{children}
			{sheet}
		</>
	);
}
