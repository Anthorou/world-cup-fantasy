"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Users, TableProperties, User } from "lucide-react";
import { useApp } from "../contexts/worldCupContext";
import { players } from "../data/pool";

const links = [
	{ href: "/standings", mobileLabel: "Pool", label: "Pool Standings", icon: Trophy},
	{ href: "/my-teams", mobileLabel: "Teams", label: "My Teams", icon: Users},
	{ href: "/groups", mobileLabel: "Groups", label: "Groups Standings", icon: TableProperties},
]

export function NavBar(): React.ReactNode {
	const { selectedPlayerId } = useApp();
	const pathname = usePathname();

	const player = players.find(player => player.id == selectedPlayerId);

	return (
		<header className="border-b border-white/10 bg-slate-900/80">
			<nav className="mx-auto grid max-w-6xl grid-cols-[2fr_1fr] items-center gap-3 px-4 py-4 md:grid-cols-[1fr_2fr_1fr]">
				<Link href="/" className="whitespace-nowrap text-lg font-bold">
					{"[ World Cup Fantasy ]"}
				</Link>
				<div className="col-span-2 grid grid-cols-3 gap-2 md:col-span-1 md:col-start-2 md:gap-4">
					{links.map(link => {
						const isActive = pathname === link.href;
						const Icon = link.icon;
	
						return (
							<Link
								key={link.href}
								href={link.href}
								className={
									isActive
										? "flex min-w-0 items-center justify-center gap-1 rounded-md bg-slate-700 px-2 py-2 text-xs font-medium text-white md:gap-2 md:px-3 md:text-sm"
										: "flex min-w-0 items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white md:gap-2 md:px-3 md:text-sm"
								}
							>
								<Icon size={16} className="shrink-0" />
								<span className="md:hidden">{link.mobileLabel}</span>
								<span className="hidden md:inline">{link.label}</span>
							</Link>
						);
					})}
				</div>
				<Link
					href="/who-are-you"
					className="col-start-2 row-start-1 flex items-center gap-2 justify-self-end rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white md:col-start-3"
				>
					{player && (
						<img
							src={player.avatar}
							alt={player.name}
							className="h-8 w-8 rounded-full object-cover"
						/>
					)}

					<span>{player?.name ?? "Select Player"}</span>
				</Link>
			</nav>
		</header>
	);
}