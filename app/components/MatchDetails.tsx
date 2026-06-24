"use client";

import { useEffect, useState } from "react";
import { MatchDetailsData, MatchEvent, TeamStats } from "@/app/types/pool";

interface MatchDetailsProps {
	fixtureId: number;
	isLive: boolean;
}

const visibleStats = [
	"Ball Possession",
	"expected_goals",
	"Shots on Goal",
	"Total Shots",
	"Corner Kicks",
	"Fouls",
	"Yellow Cards",
	"Red Cards",
];

export function MatchDetails({ fixtureId, isLive }: MatchDetailsProps): React.ReactNode {
	const [details, setDetails] = useState<MatchDetailsData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		async function loadDetails() {
			const response = await fetch(
				`/api/world-cup/match-details?fixture=${fixtureId}&live=${isLive}`
			);

			const result: MatchDetailsData = await response.json();

			if (!mounted) return;

			setDetails(result);
			setLoading(false);
		}

		loadDetails();

		if (!isLive) {
			return () => {
				mounted = false;
			};
		}

		const interval = setInterval(loadDetails, 30000);

		return () => {
			mounted = false;
			clearInterval(interval);
		};
	}, [fixtureId, isLive]);

	if (loading) {
		return (
			<div className="mt-4 rounded-lg border border-white/10 bg-slate-950 p-4 text-sm text-slate-400">
				Loading match details...
			</div>
		);
	}

	if (details == null) {
		return null;
	}

	return (
		<div className="mt-4 space-y-4 rounded-lg border border-white/10 bg-slate-950 p-4">
			<Events events={details.events} statistics={details.statistics} />
			<Statistics statistics={details.statistics} />
		</div>
	);
}

function Events({ events, statistics,}: { events: MatchEvent[]; statistics: TeamStats[]; }): React.ReactNode {
	if (statistics.length < 2) {
		return null;
	}

	const leftTeam = statistics[0];
	const rightTeam = statistics[1];

	const leftEvents = events.filter(event => event.teamId === leftTeam.teamId);
	const rightEvents = events.filter(event => event.teamId === rightTeam.teamId);

	if (!events.length) {
		return (
			<section>
				<div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center">
					<div className="flex justify-center">
						<img src={leftTeam.logo} alt={leftTeam.teamName} className="h-8 w-8 object-contain" />
					</div>

					<h4 className="text-center text-sm font-semibold text-slate-300">Events</h4>

					<div className="flex justify-center">
						<img src={rightTeam.logo} alt={rightTeam.teamName} className="h-8 w-8 object-contain" />
					</div>
				</div>

				<p className="text-center text-sm text-slate-500">No goals or cards yet.</p>
			</section>
		);
	}

	return (
		<section>
			<div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center">
				<div className="flex justify-center">
					<img src={leftTeam.logo} alt={leftTeam.teamName} className="h-8 w-8 object-contain" />
				</div>

				<h4 className="px-4 text-center text-sm font-semibold text-slate-300">Events</h4>

				<div className="flex justify-center">
					<img src={rightTeam.logo} alt={rightTeam.teamName} className="h-8 w-8 object-contain" />
				</div>
			</div>

			<div className="grid grid-cols-[1fr_auto_1fr] gap-1">
				<div className="space-y-2">
					{leftEvents.map((event, index) => (
						<LeftEvent key={`${event.time}-${event.playerName}-${index}`} event={event} />
					))}
				</div>

				<div className="w-px bg-white/20" />

				<div className="space-y-2">
					{rightEvents.map((event, index) => (
						<RightEvent key={`${event.time}-${event.playerName}-${index}`} event={event} />
					))}
				</div>
			</div>
		</section>
	);
}

function LeftEvent({ event }: { event: MatchEvent }): React.ReactNode {
	return (
		<div className="grid grid-cols-[1fr_auto] items-start gap-1">
			<div className="min-w-0 text-right">
				<div className="flex items-center justify-end gap-1">
					<p className="truncate text-sm font-medium">{event.playerName}</p>
					<EventIcon event={event} />
				</div>
			</div>

			<span className="w-7 text-right text-sm text-slate-400">
				{formatEventTime(event)}
			</span>
		</div>
	);
}

function RightEvent({ event }: { event: MatchEvent }): React.ReactNode {
	return (
		<div className="grid grid-cols-[auto_1fr] items-start gap-1">
			<span className="w-7 text-left text-sm text-slate-400">
				{formatEventTime(event)}
			</span>

			<div className="min-w-0 text-left">
				<div className="flex items-center gap-1">
					<EventIcon event={event} />
					<p className="truncate text-sm font-medium">{event.playerName}</p>
				</div>
			</div>
		</div>
	);
}

function EventIcon({ event }: { event: MatchEvent }): React.ReactNode {
	if (event.type === "Goal") {
		return <span className="text-sm">⚽</span>;
	}

	if (event.detail === "Red Card") {
		return <span className="h-5 w-3 shrink-0 rounded-[2px] bg-red-500" />;
	}

	return <span className="h-5 w-3 shrink-0 rounded-[2px] bg-yellow-400" />;
}

function Statistics({ statistics }: { statistics: TeamStats[] }): React.ReactNode {
	if (statistics.length < 2) {
		return null;
	}

	const home = statistics[0];
	const away = statistics[1];

	return (
		<section>
			<h4 className="mb-3 text-center text-sm font-semibold text-slate-300">Stats</h4>

			<div className="space-y-2">
				{visibleStats.map(statName => (
					<StatRow
						key={statName}
						label={formatStatLabel(statName)}
						homeValue={getStatValue(home, statName)}
						awayValue={getStatValue(away, statName)}
					/>
				))}
			</div>
		</section>
	);
}

function StatRow({
	label,
	homeValue,
	awayValue,
}: {
	label: string;
	homeValue: string | number;
	awayValue: string | number;
}): React.ReactNode {
	return (
		<div className="grid grid-cols-[1fr_1.5fr_1fr] items-center gap-3 text-sm">
			<p className="text-left font-semibold">{homeValue}</p>
			<p className="text-center text-xs text-slate-400">{label}</p>
			<p className="text-right font-semibold">{awayValue}</p>
		</div>
	);
}

function getStatValue(team: TeamStats, statName: string): string | number {
	const stat = team.statistics.find(stat => stat.type === statName);

	return stat?.value ?? "-";
}

function formatEventTime(event: MatchEvent): string {
	if (event.time == null) {
		return "-";
	}

	return event.extraTime != null
		? `${event.time}+${event.extraTime}'`
		: `${event.time}'`;
}

function formatStatLabel(statName: string): string {
	switch (statName) {
		case "expected_goals":
			return "Expected Goals";

		case "Ball Possession":
			return "Possession";

		case "Shots on Goal":
			return "Shots on Target";

		case "Corner Kicks":
			return "Corners";

		default:
			return statName;
	}
}