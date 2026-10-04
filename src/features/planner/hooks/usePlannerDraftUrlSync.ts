import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import {
	buildPlannerNewPath,
	parsePlannerDraft,
	type PlannerDraft,
	serializePlannerDraft
} from "@/shared/model/planner-path";

export function usePlannerDraftUrlSync(draft: PlannerDraft, onUrlDraftChange: (draft: PlannerDraft) => void) {
	const searchParams = useSearchParams();
	const urlDraft = parsePlannerDraft(new URLSearchParams(searchParams.toString()));
	const urlQuery = serializePlannerDraft(urlDraft).toString();
	const draftQuery = serializePlannerDraft(draft).toString();
	const writtenQueryRef = useRef(urlQuery);
	const seenUrlQueryRef = useRef(urlQuery);

	useEffect(() => {
		if (draftQuery === writtenQueryRef.current) {
			return;
		}

		writtenQueryRef.current = draftQuery;
		window.history.replaceState(null, "", buildPlannerNewPath(draft));
	}, [draft, draftQuery]);

	useEffect(() => {
		if (urlQuery === seenUrlQueryRef.current) {
			return;
		}

		seenUrlQueryRef.current = urlQuery;

		if (urlQuery === writtenQueryRef.current) {
			return;
		}

		writtenQueryRef.current = urlQuery;
		onUrlDraftChange(urlDraft);
	}, [urlQuery, urlDraft, onUrlDraftChange]);
}
