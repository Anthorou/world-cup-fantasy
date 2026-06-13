"use client";

import { usePathname, useRouter } from "next/navigation";
import { useApp } from "../contexts/worldCupContext";
import { useEffect } from "react";

export function RequirePlayer({ children }: { children: React.ReactNode }): React.ReactNode {
	const { selectedPlayerId, isPlayerLoading } = useApp();
	const pathName = usePathname();
	const router = useRouter();

	useEffect(() => {
		if (isPlayerLoading) {
			return;
		}

		if (!selectedPlayerId && pathName !== "/who-are-you") {
			router.push("/who-are-you");
		}
	}, [selectedPlayerId, pathName, router]);

	if (isPlayerLoading) {
		return null;
	}

	return (
		<>{children}</>
	);
}