import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { type CourseRequestDraft, parseCourseRequestDraft, serializeCourseRequestDraft } from "../model/course-request";
import { buildPlannerNewPath } from "../model/planner-path";

export function useCourseDraftUrlSync(
	draft: CourseRequestDraft,
	onUrlDraftChange: (draft: CourseRequestDraft) => void
) {
	const searchParams = useSearchParams();
	const urlDraft = parseCourseRequestDraft(new URLSearchParams(searchParams.toString()));
	const urlQuery = serializeCourseRequestDraft(urlDraft).toString();
	const draftQuery = serializeCourseRequestDraft(draft).toString();
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
