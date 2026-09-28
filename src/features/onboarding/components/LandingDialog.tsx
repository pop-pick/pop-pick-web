"use client";

import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { type MouseEvent, type SyntheticEvent, useEffect, useId, useRef, useState } from "react";

import { tv } from "@/shared/lib/tv";

import { isLandingDismissed, markLandingDismissed } from "../model/landing-dismissal";

const HIDDEN_CARD_STYLE = { opacity: 0, y: 48, scale: 0.96 };
const SHOWN_CARD_STYLE = { opacity: 1, y: 0, scale: 1 };
const CARD_TRANSITION = { type: "spring", bounce: 0.3, duration: 0.5 } as const;
const PIN_FLOAT_KEYFRAMES = { y: [0, -6, 0] };
const PIN_FLOAT_TRANSITION = { duration: 3, ease: "easeInOut", repeat: Infinity } as const;

const landingActionVariants = tv({
	base: "flex h-10 items-center justify-center rounded-xl text-b1-14 focus-ring transition-colors focus-visible:outline-bg-1",
	variants: {
		tone: {
			solid: "bg-bg-1 text-primary hover:bg-primary-subtle",
			ghost: "text-text-w hover:bg-bg-1/10"
		}
	}
});

interface LandingDialogProps {
	loginHref: string;
}

export function LandingDialog({ loginHref }: LandingDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	const descriptionId = useId();
	const [isVisible, setIsVisible] = useState(() => !isLandingDismissed());
	const [isClosing, setIsClosing] = useState(false);

	useEffect(() => {
		const dialog = dialogRef.current;

		if (dialog && !dialog.open) {
			dialog.showModal();
			dialog.focus();
		}
	}, []);

	const handleBrowseClick = () => {
		setIsClosing(true);
	};

	const handleDialogCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
		event.preventDefault();
		setIsClosing(true);
	};

	const handleDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
		if (event.target === event.currentTarget) {
			setIsClosing(true);
		}
	};

	const handleCardAnimationComplete = () => {
		if (!isClosing) {
			return;
		}

		markLandingDismissed();
		dialogRef.current?.close();
		setIsVisible(false);
	};

	if (!isVisible) {
		return null;
	}

	return (
		<dialog
			ref={dialogRef}
			tabIndex={-1}
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			data-closing={isClosing ? "" : undefined}
			onCancel={handleDialogCancel}
			onClick={handleDialogClick}
			className="m-auto scrollbar-subtle w-full max-w-83.75 overflow-visible overflow-y-auto-when-short bg-transparent p-0 backdrop-fade backdrop:bg-dim"
		>
			<m.div
				initial={HIDDEN_CARD_STYLE}
				animate={isClosing ? HIDDEN_CARD_STYLE : SHOWN_CARD_STYLE}
				transition={CARD_TRANSITION}
				onAnimationComplete={handleCardAnimationComplete}
				className="relative h-119.5 overflow-hidden rounded-5xl shadow-modal"
			>
				<Image
					src="/illustrations/landing-map-background.svg"
					alt=""
					fill
					sizes="335px"
					loading="eager"
					className="object-cover"
				/>
				<h2 id={titleId} className="absolute inset-x-0 top-9.75 flex justify-center">
					<Image src="/illustrations/landing-title.svg" alt="서울 팝업 지도" width={261} height={33} loading="eager" />
				</h2>
				<m.div animate={PIN_FLOAT_KEYFRAMES} transition={PIN_FLOAT_TRANSITION} className="absolute top-35.5 left-33">
					<Image src="/illustrations/landing-pin.svg" alt="" width={72} height={78} loading="eager" />
				</m.div>
				<p id={descriptionId} className="absolute inset-x-0 top-76.5 text-center text-b2-16 text-text-w-2">
					이젠 팝업 찾지 마세요
					<br />
					오늘 갈 팝업 PICK 해드릴게요!
				</p>
				<div className="absolute inset-x-4 top-93 flex flex-col gap-2.5">
					<Link href={loginHref} className={landingActionVariants({ tone: "solid" })}>
						나에게 맞는 팝업 찾기
					</Link>
					<button type="button" onClick={handleBrowseClick} className={landingActionVariants({ tone: "ghost" })}>
						둘러보기
					</button>
				</div>
			</m.div>
		</dialog>
	);
}
