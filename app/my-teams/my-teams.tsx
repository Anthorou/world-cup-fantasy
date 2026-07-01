"use client";

import { useEffect, useState } from "react";
import { LastRefreshed } from "../components/LastRefreshed";
import { useApp } from "../contexts/worldCupContext";
import { teams } from "../data/pool";
import { KnockoutMatch, KnockoutResponse } from "../types/pool";
import { RefreshCw, Skull } from "lucide-react";

function getKnockoutWinPoints(round: string): number {
	switch (round) {
		case "Round of 32":
			return 4;
		case "Round of 16":
			return 8;
		case "Quarter-finals":
			return 12;
		case "Semi-finals":
			return 16;
		case "Final":
			return 20;
		default:
			return 0;
	}
}

function isFinal(match: KnockoutMatch): boolean {
	return ["FT", "AET", "PEN"].includes(match.statusShort);
}

function isEliminated(teamId: number, knockoutMatches: KnockoutMatch[]): boolean {
	const qualifiedTeamIds = new Set(
		knockoutMatches
			.filter(match => match.round === "Round of 32")
			.flatMap(match => [match.home.id, match.away.id])
	);

	if (!qualifiedTeamIds.has(teamId)) {
		return true;
	}

	const teamMatches = knockoutMatches
		.filter(match => match.home.id === teamId || match.away.id === teamId)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	const lastMatch = teamMatches[0];

	if (!lastMatch || !isFinal(lastMatch)) {
		return false;
	}

	if (lastMatch.home.id === teamId) {
		return lastMatch.home.winner === false;
	}

	return lastMatch.away.winner === false;
}

export function MyTeams(): React.ReactNode {
	const { standings, selectedPlayerId } = useApp();

	const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatch[]>([]);
	const [knockoutLoaded, setKnockoutLoaded] = useState(false);

	useEffect(() => {
		let mounted = true;

		async function loadKnockout() {
			const response = await fetch("/api/world-cup/knockout");
			const result: KnockoutResponse = await response.json();

			if (!mounted) return;

			setKnockoutMatches(result.matches);
			setKnockoutLoaded(true);
		}

		loadKnockout();

		return () => {
			mounted = false;
		};
	}, []);

	const qualifiedTeamIds = new Set(
		knockoutMatches
			.filter(match => match.round === "Round of 32")
			.flatMap(match => [match.home.id, match.away.id])
	);

	const knockoutWinPointsByTeamId = new Map<number, number>();

	for (const match of knockoutMatches) {
		const points = getKnockoutWinPoints(match.round);

		if (points === 0) continue;

		if (isFinal(match) && match.home.winner) {
			knockoutWinPointsByTeamId.set(
				match.home.id,
				(knockoutWinPointsByTeamId.get(match.home.id) ?? 0) + points
			);
		}

		if (isFinal(match) && match.away.winner) {
			knockoutWinPointsByTeamId.set(
				match.away.id,
				(knockoutWinPointsByTeamId.get(match.away.id) ?? 0) + points
			);
		}
	}

	const myTeams = teams
		.filter(team => team.ownerId == selectedPlayerId)
		.map(team => {
			const standing = standings.find(item => item.teamId == team.id);

			if (!standing) {
				return null;
			}

			const groupStagePoints = standing.points ?? 0;
			const qualificationPoints = qualifiedTeamIds.has(team.id) ? 1 : 0;
			const groupWinnerPoints = standing.rank === 1 ? 1 : 0;
			const knockoutPoints = knockoutWinPointsByTeamId.get(team.id) ?? 0;
			const totalPoints = groupStagePoints + qualificationPoints + groupWinnerPoints + knockoutPoints;

			return {
				...standing,
				groupStagePoints,
				qualificationPoints,
				groupWinnerPoints,
				knockoutPoints,
				totalPoints,
			};
		})
		.filter(team => team != null)
		.sort((a, b) => b.totalPoints - a.totalPoints);

	const totalPoints = myTeams.reduce((sum, team) => sum + team.totalPoints, 0);

	if (!knockoutLoaded) {
		return (
			<section className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold">My Teams</h1>
				</div>

				<p className="text-sm text-slate-400">Loading teams...</p>
			</section>
		);
	}

	return (
		<section className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">My Teams</h1>

				<button
					onClick={() => window.location.reload()}
					className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
					aria-label="Refresh"
				>
					<RefreshCw className="h-5 w-5" />
				</button>
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
									<div className="flex items-center gap-2">
										<h2 className="font-semibold">{team.teamName}</h2>

										{isEliminated(team.teamId, knockoutMatches) && (
											<Skull className="h-4 w-4 text-red-400" />
										)}
									</div>
									<p className="text-sm text-slate-400">
										{team.group}
									</p>
								</div>
							</div>

							<div className="text-right">
								<div className="text-lg font-bold">
									{team.totalPoints} pts
								</div>

								<div className="text-sm text-slate-400">
									Rank #{team.rank}
								</div>
							</div>
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