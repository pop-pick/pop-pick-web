import { ScreenPlaceholder } from "@/shared/ui/ScreenPlaceholder";

export default async function PopupDetailPage({ params }: PageProps<"/popups/[popupId]">) {
	const { popupId } = await params;

	return (
		<ScreenPlaceholder
			title={`팝업 상세 ${popupId}`}
			description="갤러리와 운영 정보, 주소와 길찾기, 탭 셋과 하단 액션이 놓이는 전체 화면입니다."
		/>
	);
}
