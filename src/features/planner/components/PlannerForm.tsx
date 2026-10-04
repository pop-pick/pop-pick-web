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
import { BottomActionBar } from "@/shared/ui/BottomActionBar";
import { Button } from "@/shared/ui/Button";
import { ChoiceChipGrid } from "@/shared/ui/ChoiceChipGrid";
import { Select } from "@/shared/ui/Select";

import { useGeneratePlanner } from "../hooks/useGeneratePlanner";
import { usePlannerDraftUrlSync } from "../hooks/usePlannerDraftUrlSync";
import {
	getSelectableDateRange,
	getSelectableStartTimes,
	sanitizePlannerDraft,
	toGeneratePlannerRequest
} from "../model/course-request";
import { toExpiredConditionMessage, toGenerateFailureMessage } from "../model/generate-failure";
import { PLANNER_FORM_TITLE, type PlannerFormData, toChoiceOptions, toggleOptionId } from "../model/planner-form";
import { ConditionHint } from "./ConditionHint";
import { ConditionSection } from "./ConditionSection";
import { DateField } from "./DateField";
import { GeneratingView } from "./GeneratingView";
import { NoteSection } from "./NoteSection";

const COMPANION_OPTIONS = COMPANION_TYPES.map((companion) => ({
	value: companion,
	label: COMPANION_TYPE_LABELS[companion]
}));
const DURATION_OPTIONS = TRIP_DURATIONS.map((duration) => ({ value: duration, label: TRIP_DURATION_LABELS[duration] }));

interface PlannerFormProps {
	form: PlannerFormData;
	initialDraft: PlannerDraft;
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

	usePlannerDraftUrlSync(draft, handleUrlDraftChange);

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

	const handleCompanionChange = (companion: CompanionType) => {
		setValue("companion", companion);
	};

	const handleCategoryToggle = (categoryId: number) => {
		setValue("categoryIds", toggleOptionId(form.categories, getValues("categoryIds"), categoryId));
	};

	const handleActivityToggle = (activityId: number) => {
		setValue("activityIds", toggleOptionId(form.activities, getValues("activityIds"), activityId));
	};

	const handleDurationChange = (duration: TripDuration) => {
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

	const handleFailureConfirm = () => {
		setIsFailureOpen(false);
		resetGeneration();
	};

	const areaOptions = toChoiceOptions(form.areas);
	const categoryOptions = toChoiceOptions(form.categories);
	const activityOptions = toChoiceOptions(form.activities);

	return (
		<>
			{isGenerating && <GeneratingView onCancel={handleGenerateCancel} />}
			<div hidden={isGenerating} className="flex flex-1 flex-col">
				<PageHeader title={PLANNER_FORM_TITLE} fallbackPath={PLANNER_PATH} isSticky />
				<form onSubmit={handleSubmit} className="flex flex-1 flex-col">
					<div className="flex flex-col items-center px-5 pt-1.75 text-center">
						<Image src="/images/illustrations/planner-map-pin.svg" alt="" width={111} height={111} loading="eager" />
						<h1 className="mt-2 text-h1 leading-8 text-text-1">어떤 코스를 원하세요?</h1>
						<p className="mt-3 text-b2-14 whitespace-pre-line text-text-4">
							{"조건을 알려주면 AI가\n이동 동선까지 계획해드려요."}
						</p>
					</div>
					<div className="flex flex-col gap-10 px-5 pt-10 pb-12.25">
						<ConditionSection titleId={areaTitleId} title="지역" trailing={<ConditionHint text="한 곳만 선택 가능" />}>
							<ChoiceChipGrid
								type="radio"
								name="area"
								labelledBy={areaTitleId}
								options={areaOptions}
								selectedValues={draft.areaId === null ? [] : [draft.areaId]}
								onToggle={handleAreaChange}
							/>
						</ConditionSection>
						<ConditionSection titleId={companionTitleId} title="동행 유형">
							<ChoiceChipGrid
								type="radio"
								name="companion"
								labelledBy={companionTitleId}
								options={COMPANION_OPTIONS}
								selectedValues={draft.companion === null ? [] : [draft.companion]}
								onToggle={handleCompanionChange}
							/>
						</ConditionSection>
						<ConditionSection
							titleId={categoryTitleId}
							title="관심 카테고리"
							trailing={<ConditionHint text="복수선택 가능" />}
						>
							<ChoiceChipGrid
								type="checkbox"
								name="category"
								labelledBy={categoryTitleId}
								options={categoryOptions}
								selectedValues={draft.categoryIds}
								onToggle={handleCategoryToggle}
							/>
						</ConditionSection>
						<ConditionSection
							titleId={activityTitleId}
							title="선호 활동"
							trailing={<ConditionHint text="복수선택 가능" />}
						>
							<ChoiceChipGrid
								type="checkbox"
								name="activity"
								labelledBy={activityTitleId}
								options={activityOptions}
								selectedValues={draft.activityIds}
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
									formatOptionLabel={String}
									label="시작 시간"
									labelledBy={scheduleTitleId}
									size="field"
								/>
							</div>
						</ConditionSection>
						<ConditionSection titleId={durationTitleId} title="가능한 소요 시간">
							<ChoiceChipGrid
								type="radio"
								name="duration"
								labelledBy={durationTitleId}
								options={DURATION_OPTIONS}
								selectedValues={draft.duration === null ? [] : [draft.duration]}
								onToggle={handleDurationChange}
							/>
						</ConditionSection>
						<NoteSection note={draft.note} onChange={handleNoteChange} />
					</div>
					<BottomActionBar>
						<Button ref={submitButtonRef} type="submit" size="xl" disabled={!canSubmit} className="w-full">
							AI 코스 생성하기
						</Button>
					</BottomActionBar>
				</form>
			</div>
			<AlertDialog
				open={isFailureOpen}
				message={failureMessage}
				onConfirm={handleFailureConfirm}
				onClosed={handleFailureClosed}
			/>
		</>
	);
}
