import { Match } from "@/app/types/pool";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

const TIMEZONE = "America/Toronto";

function formatDate(date: Date): string {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: TIMEZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);

	const year = parts.find(part => part.type === "year")?.value;
	const month = parts.find(part => part.type === "month")?.value;
	const day = parts.find(part => part.type === "day")?.value;

	return `${year}-${month}-${day}`;
}

const getWorldCupFixtures = unstable_cache(
	async () => {
		const today = new Date();
		const tomorrow = new Date();

		tomorrow.setDate(today.getDate() + 1);

		const response = await fetch(
			`https://v3.football.api-sports.io/fixtures?league=1&season=2026&from=${formatDate(today)}&to=${formatDate(tomorrow)}&timezone=${TIMEZONE}`,
			{
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
			},
			away: {
				id: match.teams.away.id,
				name: match.teams.away.name,
				logo: match.teams.away.logo,
				score: match.goals.away,
			},
		}));

		return {
			matches,
			fetchedAt: new Date().toISOString(),
		}
	},
	["world-cup-fixtures"],
	{
		revalidate: 900,
	}
);

export async function GET() {
	const result = await getWorldCupFixtures();

	return NextResponse.json(result);
}