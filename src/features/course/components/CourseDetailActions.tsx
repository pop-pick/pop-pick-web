"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import ShareIcon from "@/shared/assets/icons/share.svg";
import { buildCoursePath } from "@/shared/model/course-path";
import { PLANNER_PATH } from "@/shared/model/planner-path";
import { AlertDialog } from "@/shared/ui/AlertDialog";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import { useCancelCourse } from "../hooks/useCancelCourse";

interface CourseDetailActionsProps {
	courseId: number;
	canDelete: boolean;
}

const COPIED_MESSAGE = "링크가 클립보드에 복사되었습니다";
const COPY_FAILED_MESSAGE = "링크를 복사하지 못했습니다.\n아래 링크를 직접 복사해 주세요.";
const DELETE_MESSAGE = "일정을 삭제하시겠어요?\n삭제한 일정은 복구할 수 없습니다.";
const DELETE_FAILED_MESSAGE = "일정을 삭제하지 못했어요.\n잠시 뒤 다시 시도해 주세요.";

interface ShareResult {
	message: string;
	failedUrl?: string;
}

export function CourseDetailActions({ courseId, canDelete }: CourseDetailActionsProps) {
	const router = useRouter();
	const { mutate: cancelCourse, isPending: isDeleting } = useCancelCourse();
	const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
	const [shareResult, setShareResult] = useState<ShareResult>({ message: COPIED_MESSAGE });
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleteFailed, setIsDeleteFailed] = useState(false);
	const deleteButtonRef = useRef<HTMLButtonElement>(null);

	const handleShare = async () => {
		const url = `${window.location.origin}${buildCoursePath(courseId)}`;

		try {
			await navigator.clipboard.writeText(url);
			setShareResult({ message: COPIED_MESSAGE });
			setIsShareDialogOpen(true);
		} catch (error) {
			console.error("[course] 일정 링크를 클립보드에 복사하지 못했다", error);
			setShareResult({ message: COPY_FAILED_MESSAGE, failedUrl: url });
			setIsShareDialogOpen(true);
		}
	};

	const handleShareDialogClose = () => {
		setIsShareDialogOpen(false);
	};

	const handleDeleteClick = () => {
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteCancel = () => {
		setIsDeleteDialogOpen(false);
	};

	const handleDeleteConfirm = () => {
		setIsDeleteDialogOpen(false);
		cancelCourse(courseId, {
			onSuccess: () => {
				router.replace(PLANNER_PATH);
			},
			onError: (error) => {
				console.error(`[course] 일정 ${String(courseId)}를 삭제하지 못했다`, error);
				setIsDeleteFailed(true);
			}
		});
	};

	const handleDeleteFailureClosed = () => {
		deleteButtonRef.current?.focus();
	};

	const handleDeleteFailureClose = () => {
		setIsDeleteFailed(false);
	};

	return (
		<div className="flex flex-col gap-2.5">
			<button
				type="button"
				onClick={handleShare}
				className="flex h-10.5 items-center justify-center gap-2 rounded-xl bg-primary text-b1-14 text-text-w focus-ring transition-colors hover:bg-primary-strong"
			>
				<SvgIcon icon={ShareIcon} size={16} />
				공유하기
			</button>
			{canDelete && (
				<button
					ref={deleteButtonRef}
					type="button"
					disabled={isDeleting}
					aria-busy={isDeleting}
					onClick={handleDeleteClick}
					className="h-10.5 rounded-xl text-b1-14 text-text-4 focus-ring transition-colors not-disabled:hover:bg-bg-2 disabled:opacity-40"
				>
					삭제하기
				</button>
			)}
			<AlertDialog
				open={isShareDialogOpen}
				message={shareResult.message}
				detail={shareResult.failedUrl}
				onConfirm={handleShareDialogClose}
			/>
			<AlertDialog
				open={isDeleteDialogOpen}
				message={DELETE_MESSAGE}
				confirmLabel="삭제"
				onConfirm={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
			/>
			<AlertDialog
				open={isDeleteFailed}
				message={DELETE_FAILED_MESSAGE}
				onConfirm={handleDeleteFailureClose}
				onClosed={handleDeleteFailureClosed}
			/>
		</div>
	);
}
