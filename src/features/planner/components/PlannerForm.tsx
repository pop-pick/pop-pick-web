"use client";

import { useRouter } from "next/navigation";
import { type SubmitEvent, useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { PageHeader } from "@/shared/components/PageHeader";
import { LOGIN_CONFIRM_LABEL, LOGIN_REQUIRED_MESSAGE } from "@/shared/model/login-prompt";
import { PLANNER_PATH } from "@/shared/model/planner-path";
import {
	COMPANION_TYPE_LABELS,
	COMPANION_TYPES,
	type CompanionType,
	PARTY_SIZE_LABELS,
	PARTY_SIZES,
	type PartySize,
	PREFERRED_ACTIVITIES,
	PREFERRED_ACTIVITY_LABELS,
	type PreferredActivity,
	TRIP_DURATION_LABELS,
	TRIP_DURATIONS,
	type TripDuration
} from "@/shared/model/trip-preference";
import { AlertDialog } from "@/shared/ui/AlertDialog";
import { ChoiceChip } from "@/shared/ui/ChoiceChip";
import { Select } from "@/shared/ui/Select";

import {
	COURSE_START_TIMES,
	type CourseRequestDraft,
	formatStartTimeLabel,
	toCourseRequest
} from "../model/course-request";
import {
	appendDraftToLoginHref,
	buildGeneratingPath,
	buildPlannerNewPath,
	PENDING_COURSE_JOB_ID
} from "../model/planner-path";
import { ConditionSection } from "./ConditionSection";
import { DateField } from "./DateField";
import { NoteSection } from "./NoteSection";

const PLANNER_FORM_TITLE = "취향 분석 온보딩";

interface GuestPlannerFormProps {
	mode: "guest";
	initialDraft: CourseRequestDraft;
	/** next가 조건 입력 경로인 로그인 주소 */
	loginHref: string;
}

interface InactivePlannerFormProps {
	mode: "member" | "pending";
	initialDraft: CourseRequestDraft;
	loginHref?: never;
}

type PlannerFormProps = GuestPlannerFormProps | InactivePlannerFormProps;

export function PlannerForm({ mode, initialDraft, loginHref }: PlannerFormProps) {
	const router = useRouter();
	const { control, setValue, getValues } = useForm<CourseRequestDraft>({ defaultValues: initialDraft });
	const [companion, partySize, activities, date, startAt, duration, note] = useWatch({
		control,
		name: ["companion", "partySize", "activities", "date", "startAt", "duration", "note"]
	});
	const draft = { companion, partySize, activities, date, startAt, duration, note };
	const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
	const companionTitleId = useId();
	const partyTitleId = useId();
	const activityTitleId = useId();
	const scheduleTitleId = useId();
	const durationTitleId = useId();
	const isComplete = toCourseRequest(draft) !== null;
	const canSubmit = isComplete && mode !== "pending";

	const handleCompanionChange = (companion: CompanionType) => () => {
		setValue("companion", companion);
	};

	const handlePartySizeChange = (partySize: PartySize) => () => {
		setValue("partySize", partySize);
	};

	const handleActivityChange = (activity: PreferredActivity) => () => {
		const activities = getValues("activities");

		setValue(
			"activities",
			activities.includes(activity)
				? activities.filter((item) => item !== activity)
				: PREFERRED_ACTIVITIES.filter((item) => item === activity || activities.includes(item))
		);
	};

	const handleDurationChange = (duration: TripDuration) => () => {
		setValue("duration", duration);
	};

	const handleDateChange = (date: string) => {
		setValue("date", date);
	};

	const handleStartAtChange = (startAt: string) => {
		setValue("startAt", startAt);
	};

	const handleNoteChange = (note: string) => {
		setValue("note", note);
	};

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!canSubmit) {
			return;
		}

		if (mode === "guest") {
			setIsLoginDialogOpen(true);
			return;
		}

		window.history.replaceState(null, "", buildPlannerNewPath(draft));
		router.push(buildGeneratingPath(PENDING_COURSE_JOB_ID, draft));
	};

	const handleLoginConfirm = () => {
		setIsLoginDialogOpen(false);

		if (loginHref !== undefined) {
			router.push(appendDraftToLoginHref(loginHref, draft));
		}
	};

	const handleLoginCancel = () => {
		setIsLoginDialogOpen(false);
	};

	return (
		<>
			<PageHeader title={PLANNER_FORM_TITLE} fallbackPath={PLANNER_PATH} isSticky />
			<form onSubmit={handleSubmit} className="flex flex-1 flex-col">
				<div className="flex flex-col items-center px-5 pt-5.5 text-center">
					<div aria-hidden className="size-20 bg-bg-5" />
					<h1 className="mt-6 text-h1 leading-8 text-text-1">어떤 코스를 원하세요?</h1>
					<p className="mt-3 text-b2-14 whitespace-pre-line text-text-4">
						{"조건을 알려주면 AI가\n이동 동선까지 계획해드려요."}
					</p>
				</div>
				<div className="flex flex-col gap-10 px-5 pt-10 pb-12">
					<ConditionSection titleId={companionTitleId} title="동행 유형">
						<div role="radiogroup" aria-labelledby={companionTitleId} className="grid grid-cols-2 gap-1.75">
							{COMPANION_TYPES.map((companion) => (
								<ChoiceChip
									key={companion}
									type="radio"
									name="companion"
									value={companion}
									label={COMPANION_TYPE_LABELS[companion]}
									checked={draft.companion === companion}
									onChange={handleCompanionChange(companion)}
								/>
							))}
						</div>
					</ConditionSection>
					<ConditionSection titleId={partyTitleId} title="동행 인원수">
						<div role="radiogroup" aria-labelledby={partyTitleId} className="grid grid-cols-2 gap-1.75">
							{PARTY_SIZES.map((partySize) => (
								<ChoiceChip
									key={partySize}
									type="radio"
									name="party"
									value={String(partySize)}
									label={PARTY_SIZE_LABELS[partySize]}
									checked={draft.partySize === partySize}
									onChange={handlePartySizeChange(partySize)}
								/>
							))}
						</div>
					</ConditionSection>
					<ConditionSection
						titleId={activityTitleId}
						title="선호 활동"
						trailing={<p className="text-caption text-text-4">* 복수선택 가능</p>}
					>
						<div role="group" aria-labelledby={activityTitleId} className="grid grid-cols-2 gap-1.75">
							{PREFERRED_ACTIVITIES.map((activity) => (
								<ChoiceChip
									key={activity}
									type="checkbox"
									name="activity"
									value={activity}
									label={PREFERRED_ACTIVITY_LABELS[activity]}
									checked={draft.activities.includes(activity)}
									onChange={handleActivityChange(activity)}
								/>
							))}
						</div>
					</ConditionSection>
					<ConditionSection titleId={scheduleTitleId} title="날짜 선택">
						<div className="relative flex gap-1.75">
							<DateField labelId={scheduleTitleId} date={draft.date} onChange={handleDateChange} />
							<Select
								options={COURSE_START_TIMES}
								value={draft.startAt ?? undefined}
								onChange={handleStartAtChange}
								formatOptionLabel={formatStartTimeLabel}
								label="시작 시간"
								labelledBy={scheduleTitleId}
								size="field"
							/>
						</div>
					</ConditionSection>
					<ConditionSection titleId={durationTitleId} title="가능한 소요 시간">
						<div role="radiogroup" aria-labelledby={durationTitleId} className="grid grid-cols-2 gap-1.75">
							{TRIP_DURATIONS.map((duration) => (
								<ChoiceChip
									key={duration}
									type="radio"
									name="duration"
									value={duration}
									label={TRIP_DURATION_LABELS[duration]}
									checked={draft.duration === duration}
									onChange={handleDurationChange(duration)}
								/>
							))}
						</div>
					</ConditionSection>
					<NoteSection note={draft.note} onChange={handleNoteChange} />
				</div>
				<div className="sticky bottom-0 z-40 mt-auto rounded-t-3xl bg-bg-1 px-4 pt-4 pb-float-gap shadow-bar">
					<button
						type="submit"
						disabled={!canSubmit}
						className="flex h-13 w-full items-center justify-center rounded-xl bg-primary text-h4 text-text-w focus-ring transition-colors not-disabled:hover:bg-primary-strong disabled:bg-bg-4 disabled:text-text-6"
					>
						AI 코스 생성하기
					</button>
				</div>
			</form>
			{mode === "guest" && (
				<AlertDialog
					open={isLoginDialogOpen}
					message={LOGIN_REQUIRED_MESSAGE}
					confirmLabel={LOGIN_CONFIRM_LABEL}
					closeLabel="닫기"
					onConfirm={handleLoginConfirm}
					onCancel={handleLoginCancel}
				/>
			)}
		</>
	);
}
