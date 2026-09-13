import { ScreenPlaceholder } from "@/shared/ui/ScreenPlaceholder";

export default async function OnboardingStepPage({ params }: PageProps<"/onboarding/[step]">) {
	const { step } = await params;

	return (
		<ScreenPlaceholder
			title={`온보딩 ${step}단계`}
			description="동행 유형과 인원수, 관심 카테고리와 지역, 선호 활동과 자유 입력을 세 단계로 받는 화면입니다."
		/>
	);
}
