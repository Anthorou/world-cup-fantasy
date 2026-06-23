"use client";

import { LastRefreshed } from "../components/LastRefreshed";
import { useApp } from "../contexts/worldCupContext";
import { players, teams } from "../data/pool";
import { RefreshCw } from "lucide-react";

export function Groups(): React.ReactNode {
	const { standings } = useApp();

	const groupStageStandings = standings.filter(team =>
		!team.group.includes("Group Stage")
	);

	const groups = Object.entries(
		groupStageStandings.reduce<Record<string, typeof standings>>((acc, team) => {
			if (!acc[team.group]) {
				acc[team.group] = [];
			}

			acc[team.group].push(team);
			return acc;
		}, {})
	);

	return (
		<section className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Group Standings</h1>

				<button
					onClick={() => window.location.reload()}
					className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
					aria-label="Refresh"
				>
					<RefreshCw className="h-5 w-5" />
				</button>
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				{groups.map(([groupName, ownedTeam]) => (
					<div key={groupName} className="rounded-xl border border-white/10 bg-slate-900 p-4">
						<h2 className="mb-4 text-lg font-semibold">
                            {groupName}
                        </h2>
						<div className="space-y-2">
							{ownedTeam
								.sort((a, b) => a.rank - b.rank)
								.map(team => {
									const ownership = teams.find(
										ownedTeam => ownedTeam.id === team.teamId
									);
									
									const player = players.find(
										player => player.id === ownership?.ownerId
									);

									return (
										<div key={team.teamId} className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-slate-800 px-3 py-2">
											<div className="flex min-w-0 items-center gap-2">
												<span className="text-sm text-slate-400">
													{team.rank}
												</span>
												{player && 
													<img
														src={player.avatar}
														alt={player.name}
														className="h-6 w-6 shrink-0 rounded-full object-cover"
													/>
												}
												<img
													src={team.logo}
													alt={team.teamName}
													className="h-6 w-6 shrink-0 object-contain"
												/>
												<span className="min-w-0 truncate font-medium">
													{team.teamName}
												</span>
											</div>
											<div className="shrink-0 flex items-center gap-2">
												<div className="flex items-center gap-1 text-xs text-slate-400 sm:text-sm sm:gap-2">
													<span>{team.wins}W</span>
													<span>{team.draws}D</span>
													<span>{team.losses}L</span>
												</div>

												<span className="w-12 text-right font-bold">
													{team.points} pts
												</span>
											</div>
										</div>
									)
								})}
						</div>
					</div>
				))}
			</div>
			<div>
				<LastRefreshed />
			</div>
		</section>
	);
}