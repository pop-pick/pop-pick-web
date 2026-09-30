"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type SubmitEvent, useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { PageHeader } from "@/shared/components/PageHeader";
import { getSeoulNow } from "@/shared/lib/date";
import { useSeoulNow } from "@/shared/lib/useSeoulNow";
import { buildCoursePath } from "@/shared/model/course-path";
import { PLANNER_PATH, type PlannerDraft, serializePlannerDraft } from "@/shared/model/planner-path";
import {
	COMPANION_TYPE_LABELS,
	COMPANION_TYPES,
	type CompanionType,
	TRIP_DURATION_LABELS,
	TRIP_DURATIONS,
	type TripDuration
} from "@/shared/model/trip-preference";
import { AlertDialog } from "@/shared/ui/AlertDialog";
import { ChoiceChip } from "@/shared/ui/ChoiceChip";
import { Select } from "@/shared/ui/Select";

import { useCourseDraftUrlSync } from "../hooks/useCourseDraftUrlSync";
import { useGeneratePlanner } from "../hooks/useGeneratePlanner";
import {
	getSelectableDateRange,
	getSelectableStartTimes,
	sanitizePlannerDraft,
	toGeneratePlannerRequest
} from "../model/course-request";
import { toExpiredConditionMessage, toGenerateFailureMessage } from "../model/generate-failure";
import { type PlannerFormData, toggleOptionId } from "../model/planner-form";
import { ConditionHint } from "./ConditionHint";
import { ConditionSection } from "./ConditionSection";
import { DateField } from "./DateField";
import { GeneratingView } from "./GeneratingView";
import { NoteSection } from "./NoteSection";
import { OptionChipGroup } from "./OptionChipGroup";

const PLANNER_FORM_TITLE = "취향 분석 온보딩";

interface PlannerFormProps {
	form: PlannerFormData;
	initialDraft: PlannerDraft;
}

function formatStartTimeLabel(startAt: string) {
	return startAt;
}

export function PlannerForm({ form, initialDraft }: PlannerFormProps) {
	const router = useRouter();
	const { control, setValue, getValues, reset } = useForm<PlannerDraft>({ defaultValues: initialDraft });
	const [areaId, companion, categoryIds, activityIds, date, startAt, duration, note] = useWatch({
		control,
		name: ["areaId", "companion", "categoryIds", "activityIds", "date", "startAt", "duration", "note"]
	});
	const draft = { areaId, companion, categoryIds, activityIds, date, startAt, duration, note };
	const { mutate: generatePlanner, status: generateStatus, reset: resetGeneration } = useGeneratePlanner();
	const abortControllerRef = useRef<AbortController | null>(null);
	const submitButtonRef = useRef<HTMLButtonElement>(null);
	const shouldFocusSubmitRef = useRef(false);
	const scheduleFieldsRef = useRef<HTMLDivElement>(null);
	const [failureMessage, setFailureMessage] = useState("");
	const [isFailureOpen, setIsFailureOpen] = useState(false);
	const areaTitleId = useId();
	const companionTitleId = useId();
	const categoryTitleId = useId();
	const activityTitleId = useId();
	const scheduleTitleId = useId();
	const durationTitleId = useId();
	const renderNow = useSeoulNow();
	const startTimes = getSelectableStartTimes(form, draft.date, renderNow);
	const dateRange = getSelectableDateRange(form, renderNow);
	const canSubmit = toGeneratePlannerRequest(draft, form, renderNow) !== null;
	const isGenerating = generateStatus === "pending" || generateStatus === "success";

	const handleUrlDraftChange = (urlDraft: PlannerDraft) => {
		reset(sanitizePlannerDraft(urlDraft, form, getSeoulNow()));
	};

	useCourseDraftUrlSync(draft, handleUrlDraftChange);

	const renderMinuteMs = renderNow.getTime();

	useEffect(() => {
		const current = getValues();
		const sanitized = sanitizePlannerDraft(current, form, getSeoulNow());

		if (serializePlannerDraft(sanitized).toString() !== serializePlannerDraft(current).toString()) {
			reset(sanitized);
		}
	}, [renderMinuteMs, form, getValues, reset]);

	useEffect(() => {
		return () => {
			abortControllerRef.current?.abort();
		};
	}, []);

	useEffect(() => {
		if (!isGenerating && shouldFocusSubmitRef.current) {
			shouldFocusSubmitRef.current = false;
			submitButtonRef.current?.focus();
		}
	}, [isGenerating]);

	const handleAreaChange = (areaId: number) => {
		setValue("areaId", areaId);
	};

	const handleCompanionChange = (companion: CompanionType) => () => {
		setValue("companion", companion);
	};

	const handleCategoryToggle = (categoryId: number) => {
		setValue("categoryIds", toggleOptionId(form.categories, getValues("categoryIds"), categoryId));
	};

	const handleActivityToggle = (activityId: number) => {
		setValue("activityIds", toggleOptionId(form.activities, getValues("activityIds"), activityId));
	};

	const handleDurationChange = (duration: TripDuration) => () => {
		setValue("duration", duration);
	};

	const handleDateChange = (date: string) => {
		setValue("date", date);

		const startAt = getValues("startAt");

		if (startAt !== null && !getSelectableStartTimes(form, date, getSeoulNow()).includes(startAt)) {
			setValue("startAt", null);
		}
	};

	const handleStartAtChange = (startAt: string) => {
		setValue("startAt", startAt);
	};

	const handleNoteChange = (note: string) => {
		setValue("note", note);
	};

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		const isRequestInFlight = abortControllerRef.current !== null;
		if (isRequestInFlight) {
			return;
		}

		const now = getSeoulNow();
		const request = toGeneratePlannerRequest(draft, form, now);

		if (request === null) {
			const sanitized = sanitizePlannerDraft(draft, form, now);
			const expiredMessage = toExpiredConditionMessage(draft, sanitized);

			reset(sanitized);

			if (expiredMessage !== null) {
				setFailureMessage(expiredMessage);
				setIsFailureOpen(true);
			}

			return;
		}

		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		generatePlanner(
			{ request, signal: abortController.signal },
			{
				onSuccess: ({ plannerId }) => {
					router.push(buildCoursePath(plannerId, serializePlannerDraft(draft).toString()));
				},
				onError: (error) => {
					if (abortController.signal.aborted) {
						return;
					}

					abortControllerRef.current = null;
					console.error("[planner] 코스를 만들지 못했다", error);
					setFailureMessage(toGenerateFailureMessage(error));
					setIsFailureOpen(true);
				}
			}
		);
	};

	const handleGenerateCancel = () => {
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;
		shouldFocusSubmitRef.current = true;
		resetGeneration();
	};

	const handleFailureClosed = () => {
		if (submitButtonRef.current?.disabled === true) {
			scheduleFieldsRef.current?.querySelector("button")?.focus();
			return;
		}

		submitButtonRef.current?.focus();
	};

	const handleFailureClose = () => {
		setIsFailureOpen(false);
		resetGeneration();
	};

	return (
		<>
			{isGenerating && <GeneratingView onCancel={handleGenerateCancel} />}
			<div hidden={isGenerating} className="flex flex-1 flex-col">
				<PageHeader title={PLANNER_FORM_TITLE} fallbackPath={PLANNER_PATH} isSticky />
				<form onSubmit={handleSubmit} className="flex flex-1 flex-col">
					<div className="flex flex-col items-center px-5 pt-1.75 text-center">
						<Image src="/illustrations/planner-map-pin.svg" alt="" width={111} height={111} loading="eager" />
						<h1 className="mt-2 text-h1 leading-8 text-text-1">어떤 코스를 원하세요?</h1>
						<p className="mt-3 text-b2-14 whitespace-pre-line text-text-4">
							{"조건을 알려주면 AI가\n이동 동선까지 계획해드려요."}
						</p>
					</div>
					<div className="flex flex-col gap-10 px-5 pt-10 pb-12.25">
						<ConditionSection titleId={areaTitleId} title="지역" trailing={<ConditionHint text="한 곳만 선택 가능" />}>
							<OptionChipGroup
								type="radio"
								name="area"
								labelledBy={areaTitleId}
								options={form.areas}
								selectedIds={draft.areaId === null ? [] : [draft.areaId]}
								onToggle={handleAreaChange}
							/>
						</ConditionSection>
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
						<ConditionSection
							titleId={categoryTitleId}
							title="관심 카테고리"
							trailing={<ConditionHint text="복수선택 가능" />}
						>
							<OptionChipGroup
								type="checkbox"
								name="category"
								labelledBy={categoryTitleId}
								options={form.categories}
								selectedIds={draft.categoryIds}
								onToggle={handleCategoryToggle}
							/>
						</ConditionSection>
						<ConditionSection
							titleId={activityTitleId}
							title="선호 활동"
							trailing={<ConditionHint text="복수선택 가능" />}
						>
							<OptionChipGroup
								type="checkbox"
								name="activity"
								labelledBy={activityTitleId}
								options={form.activities}
								selectedIds={draft.activityIds}
								onToggle={handleActivityToggle}
							/>
						</ConditionSection>
						<ConditionSection titleId={scheduleTitleId} title="날짜 선택">
							<div ref={scheduleFieldsRef} className="relative flex gap-1.75">
								<DateField
									labelId={scheduleTitleId}
									date={draft.date}
									minDate={dateRange.minDate}
									maxDate={dateRange.maxDate}
									onChange={handleDateChange}
								/>
								<Select
									options={startTimes}
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
							ref={submitButtonRef}
							type="submit"
							disabled={!canSubmit}
							className="flex h-13 w-full items-center justify-center rounded-xl bg-primary text-h4 text-text-w focus-ring transition-colors not-disabled:hover:bg-primary-strong disabled:bg-bg-4 disabled:text-text-6"
						>
							AI 코스 생성하기
						</button>
					</div>
				</form>
			</div>
			<AlertDialog
				open={isFailureOpen}
				message={failureMessage}
				onConfirm={handleFailureClose}
				onClosed={handleFailureClosed}
			/>
		</>
	);
}
