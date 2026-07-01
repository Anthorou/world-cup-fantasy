"use client";

import { useEffect, useState } from "react";
import { LastRefreshed } from "../components/LastRefreshed";
import { useApp } from "../contexts/worldCupContext";
import { players, teams } from "../data/pool";
import { Crown, MoveLeft, RefreshCw, ChevronDown } from "lucide-react";
import { KnockoutMatch, KnockoutResponse } from "../types/pool";

interface FantasyStanding {
	playerId: string;
	playerName: string;
	points: number;
	groupStagePoints: number;
	qualificationPoints: number;
	groupWinnerPoints: number;
	knockoutPoints: number;
}

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

export function Standings(): React.ReactNode {
	const { standings, selectedPlayerId } = useApp();

	const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatch[]>([]);
	const [knockoutLoaded, setKnockoutLoaded] = useState(false);
	const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

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
	
		if (points === 0) {
			continue;
		}
	
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

	const fantasyStandings = players.map(player => {
		const playerTeams = teams.filter(team => team.ownerId == player.id);

		const groupStagePoints = playerTeams.reduce((sum, team) => {
			const apiTeam = standings.find(item => item.teamId == team.id);
		
			return sum + (apiTeam?.points ?? 0);
		}, 0);
		
		const qualificationPoints = playerTeams.reduce((sum, team) =>
			sum + (qualifiedTeamIds.has(team.id) ? 1 : 0)
		, 0);
		
		const groupWinnerPoints = playerTeams.reduce((sum, team) => {
			const apiTeam = standings.find(item => item.teamId == team.id);
		
			return sum + (apiTeam?.rank === 1 ? 1 : 0);
		}, 0);
		
		const knockoutPoints = playerTeams.reduce((sum, team) =>
			sum + (knockoutWinPointsByTeamId.get(team.id) ?? 0)
		, 0);
		
		const points = groupStagePoints + qualificationPoints + groupWinnerPoints + knockoutPoints;
		
		return {
			playerId: player.id,
			playerName: player.name,
			points,
			groupStagePoints,
			qualificationPoints,
			groupWinnerPoints,
			knockoutPoints,
		};
	})
	.sort((a, b) => b.points - a.points);

	if (!knockoutLoaded) {
		return (
			<section className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold">Pool Standings</h1>
				</div>
	
				<p className="text-sm text-slate-400">Loading standings...</p>
			</section>
		);
	}

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
				<div className="space-y-5">
					<StandingLeader
						player={fantasyStandings[0]}
						isCurrentPlayer={fantasyStandings[0]?.playerId == selectedPlayerId}
						isExpanded={expandedPlayerId === fantasyStandings[0]?.playerId}
						onToggle={() => setExpandedPlayerId(expandedPlayerId === fantasyStandings[0]?.playerId ? null : fantasyStandings[0]?.playerId)}
					/>

					<div className="space-y-3">
						{fantasyStandings.slice(1).map((player, index) => (
							<StandingRow
								key={player.playerId}
								player={player}
								rank={index + 2}
								isCurrentPlayer={player.playerId == selectedPlayerId}
								isExpanded={expandedPlayerId === player.playerId}
								onToggle={() => setExpandedPlayerId(expandedPlayerId === player.playerId ? null : player.playerId)}
							/>
						))}
					</div>
				</div>
			</div>
			<div>
				<LastRefreshed />
			</div>
			<div className="rounded-xl border border-white/10 bg-slate-900 p-4">
				<h2 className="mb-3 text-sm font-semibold text-slate-300">
					Scoring Rules
				</h2>

				<ul className="space-y-1 text-sm text-slate-400">
					<li>• Group stage points are based on the official FIFA standings.</li>
					<li>• +1 point for each team that qualifies for the Round of 32.</li>
					<li>• +1 point for each team that wins its group.</li>
					<li>• Round of 32 win: +4 points</li>
					<li>• Round of 16 win: +8 points</li>
					<li>• Quarter-final win: +12 points</li>
					<li>• Semi-final win: +16 points</li>
					<li>• World Cup winner: +20 points</li>
				</ul>
			</div>
		</section>
	);
}

function StandingLeader({ player, isCurrentPlayer, isExpanded, onToggle }: {
	player: FantasyStanding;
	isCurrentPlayer: boolean;
	isExpanded: boolean;
	onToggle: () => void;
}): React.ReactNode {
	const fullPlayer = players.find(item => item.id === player.playerId);

	return (
		<div className="rounded-2xl border border-amber-400/30 bg-slate-900 px-5 py-6">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full flex-col items-center text-center"
			>
				<Crown className="mb-2 h-12 w-12 fill-amber-400 text-amber-400" />

				{fullPlayer && (
					<img
						src={fullPlayer.avatar}
						alt={fullPlayer.name}
						className="h-28 w-28 rounded-full object-cover"
					/>
				)}

				<div className="mt-4 flex items-center gap-2">
					<p className="text-2xl font-bold">{player.playerName}</p>

					{isCurrentPlayer && (
						<MoveLeft className="h-5 w-5 text-white" strokeWidth={2} />
					)}
				</div>

				<p className="mt-1 text-xl font-bold text-amber-300">
					{player.points} pts
				</p>

				<div className="mt-2 flex justify-center text-slate-500">
					<ChevronDown
						className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
					/>
				</div>
			</button>

			{isExpanded && (
				<PointBreakdown player={player} />
			)}
		</div>
	);
}

function StandingRow({ player, rank, isCurrentPlayer, isExpanded, onToggle }: {
	player: FantasyStanding;
	rank: number;
	isCurrentPlayer: boolean;
	isExpanded: boolean;
	onToggle: () => void;
}): React.ReactNode {
	const fullPlayer = players.find(item => item.id === player.playerId);

	return (
		<div className="rounded-xl border border-white/10 bg-slate-900 px-5 py-4">
			<button
				type="button"
				onClick={onToggle}
				className="w-full text-left"
			>
				<div className="flex items-center justify-between">
					<div className="flex min-w-0 items-center gap-4">
						<span className="w-7 text-lg font-bold text-slate-400">
							#{rank}
						</span>

						{fullPlayer && (
							<img
								src={fullPlayer.avatar}
								alt={fullPlayer.name}
								className="h-12 w-12 rounded-full object-cover"
							/>
						)}

						<div className="flex min-w-0 items-center gap-1">
							<span className="truncate text-lg font-semibold">
								{player.playerName}
							</span>

							{isCurrentPlayer && (
								<MoveLeft className="h-5 w-5 shrink-0 text-white" strokeWidth={2} />
							)}
						</div>
					</div>

					<span className="shrink-0 text-xl font-bold">
						{player.points} pts
					</span>
				</div>

				<div className="mt-2 flex justify-center text-slate-500">
					<ChevronDown
						className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
					/>
				</div>
			</button>

			{isExpanded && (
				<PointBreakdown player={player} />
			)}
		</div>
	);
}

function PointBreakdown({ player }: { player: FantasyStanding }): React.ReactNode {
	return (
		<div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-slate-950 p-4 text-sm">
			<BreakdownRow label="Group stage" value={player.groupStagePoints} />
			<BreakdownRow label="Qualified teams" value={player.qualificationPoints} />
			<BreakdownRow label="Group winners" value={player.groupWinnerPoints} />
			<BreakdownRow label="Knockout wins" value={player.knockoutPoints} />
		</div>
	);
}

function BreakdownRow({ label, value }: { label: string; value: number }): React.ReactNode {
	return (
		<div className="flex items-center justify-between text-slate-300">
			<span>{label}</span>
			<span className="font-bold text-white">{value} pts</span>
		</div>
	);
}