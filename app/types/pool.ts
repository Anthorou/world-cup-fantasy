export interface Player {
	id: string;
	name: string;
	avatar: string;
}

export interface Teams {
	id: number;
	ownerId: string;
}

export interface ApiTeamStanding {
	teamId: number;
	teamName: string;
	points: number;
	rank: number;
	group: string;
	logo: string;
	wins: number;
    draws: number;
    losses: number;
}

export interface Match {
	id: number;
	date: string;
	elapsed: number | null;
	statusShort: string;
	statusLong: string;
	home: {
		id: number;
		name: string;
		logo: string;
		score: number | null;
	};
	away: {
		id: number;
		name: string;
		logo: string;
		score: number | null;
	};
}

export interface MatchEvent {
	time: number | null;
	extraTime: number | null;
	teamId: number;
	teamName: string;
	playerName: string;
	assistName: string | null;
	type: "Goal" | "Card";
	detail: string;
}

export interface TeamStatistic {
	type: string;
	value: string | number | null;
}

export interface TeamStats {
	teamId: number;
	teamName: string;
	logo: string;
	statistics: TeamStatistic[];
}

export interface MatchDetailsData {
	events: MatchEvent[];
	statistics: TeamStats[];
	fetchedAt: string;
}