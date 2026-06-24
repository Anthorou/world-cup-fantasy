import { Match } from "@/app/types/pool";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

interface KnockoutMatch extends Match {
	round: string;
}

const getWorldCupKnockout = unstable_cache(
	async () => {
		const response = await fetch(
			"https://v3.football.api-sports.io/fixtures?league=1&season=2026",
			{
				headers: {
					"x-apisports-key": process.env.API_FOOTBALL_KEY!,
				},
			}
		);

		const data = await response.json();

		const matches: KnockoutMatch[] = data.response
			.filter((match: any) => {
				const round = match.league.round as string | undefined;

				return round != null && !round.toLowerCase().includes("group stage");
			})
			.map((match: any) => ({
				id: match.fixture.id,
				date: match.fixture.date,
				elapsed: match.fixture.status.elapsed,
				statusShort: match.fixture.status.short,
				statusLong: match.fixture.status.long,
				round: match.league.round,
				home: {
					id: match.teams.home.id,
					name: match.teams.home.name,
					logo: match.teams.home.logo,
					score: match.goals.home,
				},
				away: {
					id: match.teams.away.id,
					name: match.teams.away.name,
					logo: match.teams.away.logo,
					score: match.goals.away,
				},
			}));

		const qualifiedTeamIds = Array.from(
			new Set(
				matches.flatMap(match =>
					[match.home.id, match.away.id].filter((id): id is number => id != null)
				)
			)
		);

		const rounds = Array.from(
			new Set(data.response.map((match: any) => match.league.round))
		);

		return {
			matches,
			qualifiedTeamIds,
			rounds,
			fetchedAt: new Date().toISOString(),
		};
	},
	["world-cup-knockout"],
	{
		revalidate: 900,
	}
);

export async function GET() {
	const result = await getWorldCupKnockout();

	return NextResponse.json(result);
}