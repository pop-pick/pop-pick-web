import { ScreenPlaceholder } from "@/shared/ui/ScreenPlaceholder";

export default async function CourseGeneratingPage({ params }: PageProps<"/planner/generating/[jobId]">) {
	const { jobId } = await params;

	return (
		<ScreenPlaceholder
			title="코스 생성 중"
			description={`작업 ${jobId}의 단계별 체크리스트와 취소 버튼이 놓이는 화면입니다.`}
		/>
	);
}
