"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { buildCourseSavedPath } from "@/shared/model/course-path";
import { AlertDialog } from "@/shared/ui/AlertDialog";
import { Button } from "@/shared/ui/Button";

import { useConfirmCourse } from "../hooks/useConfirmCourse";
import { isPastVisitDateError } from "../model/course-error";

const PAST_VISIT_DATE_MESSAGE = "방문 날짜가 지난 코스는 저장할 수 없어요.\n다시 생성해 주세요.";
const SAVE_FAILED_MESSAGE = "코스를 저장하지 못했어요.\n잠시 뒤 다시 시도해 주세요.";

interface SaveCourseButtonProps {
	courseId: number;
}

export function SaveCourseButton({ courseId }: SaveCourseButtonProps) {
	const router = useRouter();
	const { mutate: confirmCourse, isPending } = useConfirmCourse();
	const [failureMessage, setFailureMessage] = useState("");
	const [isFailureOpen, setIsFailureOpen] = useState(false);
	const isRequestInFlightRef = useRef(false);

	const handleSave = () => {
		if (isRequestInFlightRef.current) {
			return;
		}

		isRequestInFlightRef.current = true;
		confirmCourse(courseId, {
			onSuccess: () => {
				router.replace(buildCourseSavedPath(courseId));
			},
			onError: (error) => {
				isRequestInFlightRef.current = false;
				console.error(`[course] 코스 ${String(courseId)}를 저장하지 못했다`, error);
				setFailureMessage(isPastVisitDateError(error) ? PAST_VISIT_DATE_MESSAGE : SAVE_FAILED_MESSAGE);
				setIsFailureOpen(true);
			}
		});
	};

	const handleFailureClose = () => {
		setIsFailureOpen(false);
	};

	return (
		<>
			<Button size="md" disabled={isPending} aria-busy={isPending} onClick={handleSave}>
				내 플래너에 저장하기
			</Button>
			<AlertDialog open={isFailureOpen} message={failureMessage} onConfirm={handleFailureClose} />
		</>
	);
}
