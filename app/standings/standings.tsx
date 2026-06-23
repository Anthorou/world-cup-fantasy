"use client";

import { LastRefreshed } from "../components/LastRefreshed";
import { useApp } from "../contexts/worldCupContext";
import { players, teams } from "../data/pool";
import { MoveLeft, RefreshCw } from "lucide-react";

export function Standings(): React.ReactNode {
	const { standings, selectedPlayerId } = useApp();

	const fantasyStandings = players.map(player => {
		const playerTeams = teams.filter(team => team.ownerId == player.id);

		const points = playerTeams.reduce((sum, team) => {
			const apiTeam = standings.find(item => item.teamId == team.id);

			return sum + (apiTeam?.points ?? 0);
		}, 0);

		return {
			playerId: player.id,
			playerName: player.name,
			points: points
		}
	})
	.sort((a, b) => b.points - a.points);

	return (
		<section className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Pool Standings</h1>

				<button
					onClick={() => window.location.reload()}
					className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
					aria-label="Refresh"
				>
					<RefreshCw className="h-5 w-5" />
				</button>
			</div>
			<div className="space-y-3">
				{fantasyStandings.map((player, index) => {
					const isCurrentPlayer = player.playerId == selectedPlayerId;

					return (
						<div key={player.playerId} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900 px-5 py-4">
							<div className="flex items-center gap-4">
								<span className="text-lg font-bold text-slate-400">
									#{index + 1}
								</span>
								<div className="flex items-center gap-1">
									<span className="text-lg font-semibold">
										{player.playerName}
									</span>

									{isCurrentPlayer && (
										<MoveLeft
											className="h-5 w-5 text-white"
											strokeWidth={2}
										/>
									)}
								</div>
							</div>
							<span className="text-xl font-bold">
								{player.points} pts
							</span>
						</div>
					);
				})}
			</div>
			<div>
				<LastRefreshed />
			</div>
		</section>
	);
}