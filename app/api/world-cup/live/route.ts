import { Match } from "@/app/types/pool";
import { NextResponse } from "next/server";

export async function GET() {
	const response = await fetch(
		"https://v3.football.api-sports.io/fixtures?league=1&season=2026&live=all",
		{
			cache: "no-store",
			headers: {
				"x-apisports-key": process.env.API_FOOTBALL_KEY!,
			},
		}
	);

	const data = await response.json();

	const matches: Match[] = data.response.map((match: any) => ({
		id: match.fixture.id,
		date: match.fixture.date,
		elapsed: match.fixture.status.elapsed,
		statusShort: match.fixture.status.short,
		statusLong: match.fixture.status.long,
		home: {
			id: match.teams.home.id,
			name: match.teams.home.name,
			logo: match.teams.home.logo,
			score: match.goals.home,
			winner: match.teams.home.winner,
		},
		away: {
			id: match.teams.away.id,
			name: match.teams.away.name,
			logo: match.teams.away.logo,
			score: match.goals.away,
			winner: match.teams.away.winner,
		},
	}));

	return NextResponse.json({
		matches,
		fetchedAt: new Date().toISOString(),
	});
}