"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "./NavBar";
import PullToRefresh from "./PullToRefresh";

export function AppShell({ children }: { children: React.ReactNode }): React.ReactNode {
	const pathname = usePathname();
	const hideNavBar = pathname === "/who-are-you";

	return (<>
		{!hideNavBar && <NavBar />}

		<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
			<PullToRefresh />
			{children}
		</main>
	</>);
}