import * as m from "motion/react-m";

import CheckIcon from "@/shared/assets/icons/check.svg";
import { tv } from "@/shared/lib/tv";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import { GENERATING_STEP_STATE_LABELS, type GeneratingStepState } from "../model/generating-steps";

interface GeneratingStepItemProps {
	label: string;
	state: GeneratingStepState;
}

const DOT_KEYS = ["first", "second", "third"] as const;
const DOT_BOUNCE = { y: [0, -3, 0] };
const DOT_BOUNCE_SECONDS = 0.9;
const DOT_STAGGER_SECONDS = 0.15;
const CHECK_HIDDEN = { scale: 0.4, opacity: 0 };
const CHECK_SHOWN = { scale: 1, opacity: 1 };
const CHECK_TRANSITION = { type: "spring", bounce: 0.55, duration: 0.45 } as const;

const generatingStepItemVariants = tv({
	slots: {
		indicator: "flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
		label: "text-b1-16 transition-colors duration-300",
		status: "text-b2-12 transition-colors duration-300"
	},
	variants: {
		state: {
			done: {
				indicator: "border-primary bg-bg-1 text-primary",
				label: "text-text-2",
				status: "text-text-2"
			},
			active: {
				indicator: "gap-1 border-primary bg-primary",
				label: "text-primary",
				status: "text-primary"
			},
			pending: {
				indicator: "border-divider-3 bg-bg-1",
				label: "text-text-5",
				status: "text-text-5"
			}
		}
	}
});

function toDotTransition(index: number) {
	return {
		duration: DOT_BOUNCE_SECONDS,
		ease: "easeInOut",
		repeat: Infinity,
		delay: index * DOT_STAGGER_SECONDS
	} as const;
}

export function GeneratingStepItem({ label, state }: GeneratingStepItemProps) {
	const styles = generatingStepItemVariants({ state });

	return (
		<li className="flex items-center justify-between gap-3">
			<div className="flex items-center gap-3">
				<span aria-hidden className={styles.indicator()}>
					{state === "done" && (
						<m.span initial={CHECK_HIDDEN} animate={CHECK_SHOWN} transition={CHECK_TRANSITION} className="flex">
							<SvgIcon icon={CheckIcon} size={16} />
						</m.span>
					)}
					{state === "active" &&
						DOT_KEYS.map((key, index) => (
							<m.span
								key={key}
								animate={DOT_BOUNCE}
								transition={toDotTransition(index)}
								className="size-1 rounded-full bg-bg-1"
							/>
						))}
				</span>
				<span className={styles.label()}>{label}</span>
			</div>
			<span className={styles.status()}>{GENERATING_STEP_STATE_LABELS[state]}</span>
		</li>
	);
}
