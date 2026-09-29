"use client";

import { useState } from "react";

import { AlertDialog } from "@/shared/ui/AlertDialog";
import { ListRow } from "@/shared/ui/ListRow";

import { useLogout } from "../hooks/useLogout";

const LOGOUT_CONFIRM_MESSAGE = "로그아웃 하시겠습니까?";

export function LogoutMenuItem() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const { mutate: logout, isPending } = useLogout();

	const handleRowClick = () => {
		setIsDialogOpen(true);
	};

	const handleLogoutConfirm = () => {
		setIsDialogOpen(false);
		logout();
	};

	const handleLogoutCancel = () => {
		setIsDialogOpen(false);
	};

	return (
		<>
			<ListRow label="로그아웃" disabledReason={isPending ? "로그아웃 중" : undefined} onClick={handleRowClick} />
			<AlertDialog
				open={isDialogOpen}
				message={LOGOUT_CONFIRM_MESSAGE}
				onConfirm={handleLogoutConfirm}
				onCancel={handleLogoutCancel}
			/>
		</>
	);
}
