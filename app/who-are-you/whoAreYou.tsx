"use client";

import { useRouter } from "next/navigation";
import { players } from "../data/pool";
import { useApp } from "../contexts/worldCupContext";

export function WhoAreYou(): React.ReactNode {
	const router = useRouter();
	const { setSelectedPlayerId } = useApp();

	function selectPlayer(playerId: string) {
		setSelectedPlayerId(playerId);
		router.push("/");
	}

	return (
		<section className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-center">{"Who is You ??"}</h1>
			</div>
			<div className="grid gap-3 md:grid-cols-2">
				{players.map(player => (
					<button 
						key={player.id} 
						className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-900 p-5 transition-colors hover:bg-slate-800"
						onClick={() => selectPlayer(player.id)}
					>
						<img
							src={player.avatar}
							alt={player.name}
							className="h-32 w-32 rounded-full object-cover"
						/>
						<span className="text-lg font-semibold">
							{player.name}
						</span>
					</button>
				))}
			</div>
		</section>
	);
}