import { KnockoutMatch } from "../types/pool";

export function getRoundMatches(matches: KnockoutMatch[], round: string): KnockoutMatch[] {
	return matches
		.filter(match => match.round === round)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getRoundOf32Bracket(matches: KnockoutMatch[]): KnockoutMatch[] {
	const round = getRoundMatches(matches, "Round of 32");

	const bracketIndexes = [
		2, 5,
		0, 3,
		11, 10,
		9, 8,
		1, 4,
		6, 7,
		14, 13,
		12, 15,
	];

	const bracketMatches = bracketIndexes.map(index => round[index]);

	return bracketMatches.filter((match): match is KnockoutMatch => match != null);
}