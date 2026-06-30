"use client";

import { useEffect, useState } from "react";
import { KnockoutMatch, KnockoutResponse } from "../types/pool";
import { players, teams } from "../data/pool";
import { RefreshCw, Crown } from "lucide-react";

export function Knockouts(): React.ReactNode {
	const [matches, setMatches] = useState<KnockoutMatch[]>([]);

	useEffect(() => {
		let mounted = true;
	
		async function loadKnockout() {
			const response = await fetch("/api/world-cup/knockout");
			const result: KnockoutResponse = await response.json();
	
			if (!mounted) {
				return;
			}
	
			setMatches(result.matches);
		}
	
		loadKnockout();
	
		return () => {
			mounted = false;
		};
	}, []);

	const roundMatches = {
		roundOf32: matches.filter(match => match.round === "Round of 32"),
		roundOf16: matches.filter(match => match.round === "Round of 16"),
		quarterFinals: matches.filter(match => match.round === "Quarter-finals"),
		semiFinals: matches.filter(match => match.round === "Semi-finals"),
		thirdPlace: matches.filter(match => match.round === "3rd Place Final"),
		final: matches.filter(match => match.round === "Final"),
	};

	return (
		<section className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Knockout</h1>

				<button
					onClick={() => window.location.reload()}
					className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
					aria-label="Refresh"
				>
					<RefreshCw className="h-5 w-5" />
				</button>
			</div>

			<div className="space-y-6">
				<RoundSection
					title="Round of 32"
					matches={roundMatches.roundOf32}
					placeholderCount={16}
				/>

				<RoundSection
					title="Round of 16"
					matches={roundMatches.roundOf16}
					placeholderCount={8}
				/>

				<RoundSection
					title="Quarter-finals"
					matches={roundMatches.quarterFinals}
					placeholderCount={4}
				/>

				<RoundSection
					title="Semi-finals"
					matches={roundMatches.semiFinals}
					placeholderCount={2}
				/>

				<RoundSection
					title="3rd Place Final"
					matches={roundMatches.thirdPlace}
					placeholderCount={1}
				/>

				<RoundSection
					title="Final"
					matches={roundMatches.final}
					placeholderCount={1}
				/>

				<div className="rounded-xl border border-amber-400/30 bg-slate-900 p-3">
					<p className="mb-2 text-center text-sm font-semibold text-amber-300">
						Winner
					</p>

					<BracketTeam />
				</div>
			</div>
		</section>
	);
}

function BracketMatch({ match }: { match?: KnockoutMatch }): React.ReactNode {
	const homeOwnership = teams.find(team => team.id === match?.home.id);
const awayOwnership = teams.find(team => team.id === match?.away.id);

const homePlayer = players.find(player => player.id === homeOwnership?.ownerId);
const awayPlayer = players.find(player => player.id === awayOwnership?.ownerId);

return (
	<div className="rounded-lg border border-white/10 bg-slate-900 p-2">
		<BracketTeam
			name={match?.home.name ?? "TBD"}
			logo={match?.home.logo}
			score={match?.home.score ?? null}
			winner={match?.home.winner ?? false}
			playerAvatar={homePlayer?.avatar}
		/>

		<div className="my-1 border-t border-white/10" />

		<BracketTeam
			name={match?.away.name ?? "TBD"}
			logo={match?.away.logo}
			score={match?.away.score ?? null}
			winner={match?.away.winner ?? false}
			playerAvatar={awayPlayer?.avatar}
		/>
	</div>
);
}

function BracketTeam({ name = "TBD", logo = null, score = null, winner = false, playerAvatar }: {
	name?: string;
	logo?: string | null;
	score?: number | null;
	winner?: boolean | null;
	playerAvatar?: string;
}): React.ReactNode {
	return (
		<div className={`flex items-center justify-between gap-2 rounded-md px-2 py-1`}>
			<div className="flex min-w-0 items-center gap-2">
				{playerAvatar && (
					<img
						src={playerAvatar}
						alt=""
						className="h-6 w-6 shrink-0 rounded-full object-cover"
					/>
				)}

				{logo ? (
					<img
						src={logo}
						alt={name}
						className="h-5 w-5 shrink-0 object-contain"
					/>
				) : (
					<div className="h-5 w-5 shrink-0 rounded-full bg-slate-800" />
				)}

				<div className="flex min-w-0 items-center gap-1">
					<p className="truncate text-xs font-medium">
						{name}
					</p>

					{winner && (
						<Crown
							size={12}
							className="shrink-0 fill-amber-400 text-amber-400"
						/>
					)}
				</div>
			</div>

			<span className="text-xs font-bold">
				{score ?? "-"}
			</span>
		</div>
	);
}

function RoundSection({
	title,
	matches,
	placeholderCount,
}: {
	title: string;
	matches: KnockoutMatch[];
	placeholderCount: number;
}): React.ReactNode {
	const hasMatches = matches.length > 0;

	return (
		<section className="space-y-3">
			<h2 className="text-sm font-semibold text-slate-400">
				{title}
			</h2>

			<div className="grid gap-2">
				{hasMatches
					? matches.map(match => (
							<BracketMatch
								key={match.id}
								match={match}
							/>
						))
					: Array.from({ length: placeholderCount }).map((_, index) => (
							<BracketMatch
								key={index}
							/>
						))}
			</div>
		</section>
	);
}