"use client";

import { useApp } from "../contexts/worldCupContext";
import { players, teams } from "../data/pool";

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
			<div>
                <h1 className="text-3xl font-bold">Group Standings</h1>
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
										<div key={team.teamId} className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2">
											<div className="flex items-center gap-3">
												<span className="text-sm text-slate-400">
													{team.rank}
												</span>
												{player && 
													<img
														src={player.avatar}
														alt={player.name}
														className="h-6 w-6 rounded-full object-cover"
													/>
												}
												<img
													src={team.logo}
													alt={team.teamName}
													className="h-6 w-6 object-contain"
												/>
												<span className="font-medium">
													{team.teamName}
												</span>
											</div>
											<div className="flex items-center gap-4">
												<div className="flex items-center gap-2 text-sm text-slate-400">
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
		</section>
	);
}