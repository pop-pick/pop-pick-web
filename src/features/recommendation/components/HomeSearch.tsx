"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PopupSearchForm } from "@/shared/components/PopupSearchForm";
import { buildExploreSearchPath } from "@/shared/model/explore-state";

export function HomeSearch() {
	const router = useRouter();
	const [query, setQuery] = useState("");

	const handleSearchSubmit = () => {
		router.push(buildExploreSearchPath(query));
	};

	return <PopupSearchForm value={query} onChange={setQuery} onSubmit={handleSearchSubmit} />;
}
