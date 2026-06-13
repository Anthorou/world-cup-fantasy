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