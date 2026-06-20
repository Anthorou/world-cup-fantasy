"use client";

import { usePathname, useRouter } from "next/navigation";
import { useApp } from "../contexts/worldCupContext";
import { useEffect } from "react";

const kInactivityMs = 30 * 60 * 1000;

export function RequirePlayer({ children }: { children: React.ReactNode }): React.ReactNode {
	const { selectedPlayerId, isPlayerLoading } = useApp();
	const pathName = usePathname();
	const router = useRouter();

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout>;
	
		function goHomeAfterInactivity() {
			if (pathName !== "/" && pathName !== "/who-are-you") {
				router.push("/");
			}
		}
	
		function resetInactivityTimer() {
			clearTimeout(timeout);
			timeout = setTimeout(goHomeAfterInactivity, kInactivityMs);
		}
	
		function handleVisibilityChange() {
			if (!document.hidden) {
				resetInactivityTimer();
			}
		}
	
		resetInactivityTimer();
	
		window.addEventListener("click", resetInactivityTimer);
		window.addEventListener("keydown", resetInactivityTimer);
		window.addEventListener("touchstart", resetInactivityTimer);
		window.addEventListener("scroll", resetInactivityTimer);
		document.addEventListener("visibilitychange", handleVisibilityChange);
	
		return () => {
			clearTimeout(timeout);
	
			window.removeEventListener("click", resetInactivityTimer);
			window.removeEventListener("keydown", resetInactivityTimer);
			window.removeEventListener("touchstart", resetInactivityTimer);
			window.removeEventListener("scroll", resetInactivityTimer);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [pathName, router]);

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