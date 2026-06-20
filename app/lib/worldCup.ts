import { unstable_cache } from "next/cache";
import { ApiTeamStanding } from "../types/pool";

export function flattenStandings(data: any): ApiTeamStanding[] {
	return data.response[0].league.standings
		.flat()
		.map((team: any) => ({
			teamId: team.team.id,
            teamName: team.team.name,
            points: team.points,
            rank: team.rank,
            group: team.group,
            logo: team.team.logo,
			wins: team.all.win,
            draws: team.all.draw,
            losses: team.all.lose,
		}));
}

export const getWorldCupStandings = unstable_cache(
    async () => {
        const response = await fetch(
            "https://v3.football.api-sports.io/standings?league=1&season=2026",
            {
                headers: {
                    "x-apisports-key": process.env.API_FOOTBALL_KEY!,
                },
                cache: "no-store",
            }
        );

        const data = await response.json();

        return {
            data,
            fetchedAt: new Date().toISOString(),
        };
    },
    ["world-cup-standings"],
    {
        revalidate: 300,
    }
);