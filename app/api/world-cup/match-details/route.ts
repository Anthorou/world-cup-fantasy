import { MatchDetailsData, MatchEvent, TeamStats } from "@/app/types/pool";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

function isImportantEvent(event: any): boolean {
	return event.type === "Goal" || event.type === "Card";
}

async function fetchMatchDetails(fixture: string): Promise<MatchDetailsData> {
	const [eventsResponse, statisticsResponse] = await Promise.all([
		fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixture}`, {
			headers: {
				"x-apisports-key": process.env.API_FOOTBALL_KEY!,
			},
		}),
		fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixture}`, {
			headers: {
				"x-apisports-key": process.env.API_FOOTBALL_KEY!,
			},
		}),
	]);

	const eventsData = await eventsResponse.json();
	const statisticsData = await statisticsResponse.json();

	const events: MatchEvent[] = eventsData.response
		.filter(isImportantEvent)
		.map((event: any) => ({
			time: event.time.elapsed,
			extraTime: event.time.extra,
			teamId: event.team.id,
			teamName: event.team.name,
			playerName: event.player.name,
			assistName: event.assist?.name ?? null,
			type: event.type,
			detail: event.detail,
		}));

	const statistics: TeamStats[] = statisticsData.response.map((teamStats: any) => ({
		teamId: teamStats.team.id,
		teamName: teamStats.team.name,
		logo: teamStats.team.logo,
		statistics: teamStats.statistics,
	}));

	return {
		events,
		statistics,
		fetchedAt: new Date().toISOString(),
	};
}

const getCachedMatchDetails = unstable_cache(
	async (fixture: string) => fetchMatchDetails(fixture),
	["world-cup-match-details"],
	{
		revalidate: 3600,
	}
);

export async function GET(request: NextRequest) {
	const fixture = request.nextUrl.searchParams.get("fixture");
	const live = request.nextUrl.searchParams.get("live") === "true";

	if (fixture == null) {
		return NextResponse.json(
			{ error: "Missing fixture parameter" },
			{ status: 400 }
		);
	}

	const result = live
		? await fetchMatchDetails(fixture)
		: await getCachedMatchDetails(fixture);

	return NextResponse.json(result);
}