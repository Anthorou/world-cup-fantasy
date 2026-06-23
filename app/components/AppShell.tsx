"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "./NavBar";
import PullToRefresh from "./PullToRefresh";

export function AppShell({ children }: { children: React.ReactNode }): React.ReactNode {
	const pathname = usePathname();
	const hideNavBar = pathname === "/who-are-you";

	return (
		<div className="flex h-screen flex-col overflow-hidden">
			{!hideNavBar && <NavBar />}

			<main
				id="app-scroll-container"
				className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-4 py-6"
			>
				<PullToRefresh />
				{children}
			</main>
		</div>
	);
}