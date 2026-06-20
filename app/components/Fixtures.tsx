"use client";

import { useEffect, useState } from "react";
import { Match } from "../types/pool";
import { players, teams } from "../data/pool";

function formatMatchTime(date: string): string {
	return new Date(date).toLocaleTimeString("en-CA", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

function isLive(macth: Match): boolean {
	return !["NS", "FT"].includes(macth.statusShort);
}

function sortMatches(a: Match, b: Match): number {
	if (isLive(a) && !isLive(b)) {
		return -1;
	}

	if (!isLive(a) && isLive(b)) {
		return 1;
	}

	return new Date(a.date).getTime() - new Date(b.date).getTime();
}

export default function Fixtures(): React.ReactNode {
	const [matches, setMatches] = useState<Match[]>([]);
	const [liveMatches, setLiveMatches] = useState<Match[]>([]);

	useEffect(() => {
		let mounted = true;
		let liveInterval: ReturnType<typeof setInterval> | null = null;

		async function loadFixtures() {
			const response = await fetch("/api/world-cup/fixtures");
			const result = await response.json();

			if (mounted) {
				setMatches(result.matches);
		
				if (!shouldCheckLive(result.matches)) {
					setLiveMatches([]);
				}
			}

			return result.matches as Match[];
		}

		async function loadLiveMatches() {
			const response = await fetch("/api/world-cup/live");
			const result = await response.json();

			if (!mounted) {
				return;
			}

			if (result.matches.length > 0) {
				setLiveMatches(result.matches);
				return;
			}
		
			if (liveInterval != null) {
				clearInterval(liveInterval);
				liveInterval = null;
			}
		}

		function shouldCheckLive(fixtures: Match[]): boolean {
			const now = Date.now();

			return fixtures.some(match => {
				const kickoff = new Date(match.date).getTime();

				return (
					now >= kickoff - 30 * 1000 &&
					now <= kickoff + 2 * 60 * 60 * 1000
				);
			});
		}

		async function refresh() {
			const fixtures = await loadFixtures();

			if (shouldCheckLive(fixtures)) {
				await loadLiveMatches();

				if (liveInterval == null) {
					liveInterval = setInterval(loadLiveMatches, 30000);
				}
			} else {
				if (mounted) {
					setLiveMatches([]);
				}

				if (liveInterval != null) {
					clearInterval(liveInterval);
					liveInterval = null;
				}
			}
		}

		refresh();

		const fixtureInterval = setInterval(refresh, 5 * 60 * 1000);

		return () => {
			mounted = false;

			clearInterval(fixtureInterval);

			if (liveInterval != null) {
				clearInterval(liveInterval);
			}
		};
	}, []);

	const today = new Date().toLocaleDateString("en-CA");
					
	const tomorrowDate = new Date();
	tomorrowDate.setDate(tomorrowDate.getDate() + 1);
	const tomorrow = tomorrowDate.toLocaleDateString("en-CA");

	const displayedMatches = matches.map(match => {
		const liveMatch = liveMatches.find(liveMatch => liveMatch.id === match.id);

		return liveMatch ?? match;
	});

	const todayMatches = displayedMatches.filter(match =>
		new Date(match.date).toLocaleDateString("en-CA") === today
	).sort(sortMatches);

	const tomorrowMatches = displayedMatches.filter(match => 
		new Date(match.date).toLocaleDateString("en-CA") === tomorrow
	).sort(sortMatches);

	return (
		<section className="space-y-4">
			<h2 className="text-xl font-bold">Matches</h2>
			{renderMatches("Today", todayMatches)}
			{renderMatches("Tomorrow", tomorrowMatches)}
		</section>
	)
}

function renderMatches(title: string, matches: Match[]) {
	if (!matches.length) {
		return null;
	}

	return (
		<div className="space-y-3">
			<h3 className="text-sm font-semibold text-slate-400">{title}</h3>

			{matches.map(match => {
				const isFinished = match.statusShort === "FT";
				const live = isLive(match);

				const centerText = live
					? match.statusShort === "HT" ? "HT" : `${match.elapsed}'`
					: isFinished
						? "Final"
						: formatMatchTime(match.date);

				const homeOwnership = teams.find(team => team.id === match.home.id);
				const awayOwnership = teams.find(team => team.id === match.away.id);
				
				const homePlayer = players.find(player => player.id === homeOwnership?.ownerId);
				const awayPlayer = players.find(player => player.id === awayOwnership?.ownerId);

				return (
					<div key={match.id} className="rounded-xl border border-white/10 bg-slate-900 p-4">
						{/* Desktop */}
						<div className="hidden items-center gap-4 sm:grid sm:grid-cols-[1fr_auto_auto_auto_1fr]">
							<div className="flex min-w-0 items-center gap-3">
								{homePlayer && <img src={homePlayer.avatar} alt={homePlayer.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />}
								<img src={match.home.logo} alt={match.home.name} className="h-8 w-8 shrink-0 object-contain" />
								<p className="truncate font-semibold">{match.home.name}</p>
							</div>

							<p className="text-3xl font-bold">{live || isFinished ? match.home.score : "-"}</p>

							<div className="w-20 text-center">
								<p className={`text-sm font-semibold ${live ? "text-emerald-400" : "text-slate-400"}`}>
									{centerText}
								</p>

								{live && (
									<div className="flex justify-center">
										<div className="h-1 w-14 overflow-hidden rounded-full bg-emerald-400/20">
											<div className="h-full w-1/2 animate-live-bar rounded-full bg-emerald-400" />
										</div>
									</div>
								)}
							</div>

							<p className="text-3xl font-bold">{live || isFinished ? match.away.score : "-"}</p>

							<div className="flex min-w-0 items-center justify-end gap-3">
								<p className="truncate text-right font-semibold">{match.away.name}</p>
								<img src={match.away.logo} alt={match.away.name} className="h-8 w-8 shrink-0 object-contain" />
								{awayPlayer && <img src={awayPlayer.avatar} alt={awayPlayer.name} className="h-9 w-9 shrink-0 rounded-full object-cover"/>}
							</div>
						</div>

						{/* Mobile */}
						<div className="grid grid-cols-[1fr_auto] gap-4 sm:hidden">
							<div className="space-y-4">
								<div className="grid grid-cols-[1fr_auto] items-center gap-3">
									<div className="flex min-w-0 items-center gap-3">
										{homePlayer && <img src={homePlayer.avatar} alt={homePlayer.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />}
										<img src={match.home.logo} alt={match.home.name} className="h-9 w-9 shrink-0 object-contain" />
										<p className="truncate text-lg font-semibold">{match.home.name}</p>
									</div>

									<p className="text-4xl font-bold">{live || isFinished ? match.home.score : "-"}</p>
								</div>

								<div className="border-t border-white/10" />

								<div className="grid grid-cols-[1fr_auto] items-center gap-3">
									<div className="flex min-w-0 items-center gap-3">
										{awayPlayer && <img src={awayPlayer.avatar} alt={awayPlayer.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />}
										<img src={match.away.logo} alt={match.away.name} className="h-9 w-9 shrink-0 object-contain" />
										<p className="truncate text-lg font-semibold">{match.away.name}</p>
									</div>

									<p className="text-4xl font-bold">{live || isFinished ? match.away.score : "-"}</p>
								</div>
							</div>

							<div className="flex border-l border-white/10 pl-4">
								<div className="flex w-14 flex-col items-center justify-center gap-1">
									<p className={`text-sm font-semibold ${live ? "text-emerald-400" : "text-slate-400"}`}>
										{centerText}
									</p>

									{live && (
										<div className="flex justify-center">
											<div className="h-1 w-14 overflow-hidden rounded-full bg-emerald-400/20">
												<div className="h-full w-1/2 animate-live-bar rounded-full bg-emerald-400" />
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}