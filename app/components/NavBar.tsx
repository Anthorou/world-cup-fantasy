"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Users, TableProperties, User } from "lucide-react";
import { useApp } from "../contexts/worldCupContext";
import { players } from "../data/pool";

const links = [
	{ href: "/standings", label: "Pool Standings", icon: Trophy},
	{ href: "/my-teams", label: "My Teams", icon: Users},
	{ href: "/groups", label: "Groups Standings", icon: TableProperties},
]

export function NavBar(): React.ReactNode {
	const { selectedPlayerId } = useApp();
	const pathname = usePathname();

	const player = players.find(player => player.id == selectedPlayerId);

	return (
		<header className="border-b border-white/10 bg-slate-900/80">
			<nav className="mx-auto flex max-w-6xl items-center px-4 py-4">
				<Link href={"/"} className={"text-lg font-bold"}>
					{"[ World Cup Fantasy ]"}
				</Link>
				<div className="flex flex-1 justify-center gap-4">
					{links.map(link => {
						const isActive = pathname == link.href;
						const Icon = link.icon;

						return (
							<Link
								key={link.href}
								href={link.href}
								className={
									isActive 
										? "flex items-center gap-2 rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white"
                                        : "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
								}
							>
								<Icon size={16} />
								<span>{link.label}</span>
							</Link>
						)
					})}
				</div>
				<Link
					href="/who-are-you"
					className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
				>
					{/* <User size={16} /> */}
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