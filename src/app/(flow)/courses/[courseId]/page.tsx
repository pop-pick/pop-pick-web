import { ScreenPlaceholder } from "@/shared/ui/ScreenPlaceholder";

export default async function CourseResultPage({ params }: PageProps<"/courses/[courseId]">) {
	const { courseId } = await params;

	return (
		<ScreenPlaceholder
			title={`코스 ${courseId}`}
			description="지도와 번호 마커, 구간별 도보 소요시간 타임라인, 캘린더 저장 버튼이 놓이는 화면입니다."
		/>
	);
}
