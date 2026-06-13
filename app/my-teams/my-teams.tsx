"use client";

import { useApp } from "../contexts/worldCupContext";
import { teams } from "../data/pool";

export function MyTeams(): React.ReactNode {
	const { standings, selectedPlayerId } = useApp();

	const myTeams = teams
		.filter(team => team.ownerId == selectedPlayerId)
		.map(team => standings.find(item => item.teamId == team.id))
		.filter(team => team != null)
		.sort((a, b) => b.points - a.points);

	const totalPoints = myTeams.reduce((sum, team) => sum + (team.points ?? 0), 0);

	return (
		<section className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">My Teams</h1>
			</div>
			<div className="rounded-xl border border-white/10 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Total Points</p>
                <p className="mt-1 text-3xl font-bold">{totalPoints} pts</p>
            </div>
			<div className="grid gap-3 md:grid-cols-2">
				{myTeams.map(team => (
					<div key={team.teamId} className="rounded-xl border border-white/10 bg-slate-900 p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<img src={team.logo} alt={team.teamName} className="h-9 w-9 object-contain" />
								<div>
									<h2 className="font-semibold">{team.teamName}</h2>
									<p className="text-sm text-slate-400">
										{team.group}
									</p>
								</div>
							</div>
							<div className="text-right">
								<div className="font-bold text-lg">
									{team.points} pts
								</div>

								<div className="text-sm text-slate-400">
									Rank #{team.rank}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}