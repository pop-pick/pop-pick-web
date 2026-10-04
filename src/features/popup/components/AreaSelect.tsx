"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";
import { Skeleton } from "@/shared/ui/Skeleton";

import { areaListQueryOptions } from "../api/get-areas";

const ALL_AREAS_LABEL = "전체 지역";

interface AreaSelectProps {
	areaId: number | null;
	onChange: (areaId: number | null) => void;
}

export function AreaSelect({ areaId, onChange }: AreaSelectProps) {
	const { data: areas, error, isPending, refetch } = useQuery(areaListQueryOptions());

	useEffect(() => {
		if (error !== null) {
			console.error("[popup] 지역 목록을 불러오지 못했다", error);
		}
	}, [error]);

	const handleRetry = () => {
		void refetch();
	};

	if (areas === undefined) {
		return isPending ? (
			<Skeleton className="h-9.75 w-25.5 rounded-xl" />
		) : (
			<Button variant="secondary" onClick={handleRetry} className="h-9.75 w-25.5 px-0">
				지역 다시 시도
			</Button>
		);
	}

	const options = [null, ...areas.map((area) => area.id)];

	const formatAreaLabel = (option: number | null) => {
		if (option === null) {
			return ALL_AREAS_LABEL;
		}

		return areas.find((area) => area.id === option)?.name ?? "알 수 없는 지역";
	};

	return (
		<Select
			options={options}
			value={areaId}
			onChange={onChange}
			formatOptionLabel={formatAreaLabel}
			label="지역"
			size="compact"
		/>
	);
}
