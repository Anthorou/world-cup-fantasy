import { getRoundOf32Bracket } from "../lib/KnockoutBracket";
import { KnockoutMatch } from "../types/pool";

const flagCount = 32;

function getPoint(index: number, total: number, radius: number): { x: number; y: number } {
	const angle = ((index + 0.5) / total) * 360 - 90;

	return {
		x: 50 + radius * Math.cos((angle * Math.PI) / 180),
		y: 50 + radius * Math.sin((angle * Math.PI) / 180),
	};
}

function isFinal(match: KnockoutMatch): boolean {
	return ["FT", "AET", "PEN"].includes(match.statusShort);
}

function isTeamEliminatedInMatch(teamId: number, match: KnockoutMatch): boolean {
	if (!isFinal(match)) {
		return false;
	}

	if (match.home.id === teamId) {
		return match.home.winner === false;
	}

	if (match.away.id === teamId) {
		return match.away.winner === false;
	}

	return false;
}

const bracketLayers = [
	{ key: "r32", pairs: 16, fromOffset: 0, spacing: 2, fromRadius: 41, toOffset: 0.5, toRadius: 32 },
	{ key: "r16", pairs: 8, fromOffset: 0.5, spacing: 4, fromRadius: 32, toOffset: 1.5, toRadius: 24 },
	{ key: "qf", pairs: 4, fromOffset: 1.5, spacing: 8, fromRadius: 24, toOffset: 3.5, toRadius: 16 },
	{ key: "sf", pairs: 2, fromOffset: 3.5, spacing: 16, fromRadius: 16, toOffset: 7.5, toRadius: 9 },
];

interface CircularBracketProps {
	matches: KnockoutMatch[];
}

export function CircularBracket({ matches }: CircularBracketProps): React.ReactNode {
	const roundOf32 = getRoundOf32Bracket(matches);
	const roundOf32Teams = roundOf32.flatMap(match => [
		{ team: match.home, match },
		{ team: match.away, match },
	]);

	return (
		<div className="relative mx-auto aspect-square w-full max-w-[430px] rounded-3xl border border-white/10 bg-slate-950">
			<svg
				className="absolute inset-0 h-full w-full"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
			>
				{bracketLayers.map(layer => (
					<BracketLayerLines
						key={`${layer.key}-lines`}
						layer={layer}
						roundOf32={roundOf32}
					/>
				))}

				<FinalLines />

				{bracketLayers.map(layer => (
					<BracketLayerNodes
						key={`${layer.key}-nodes`}
						layer={layer}
						roundOf32={roundOf32}
					/>
				))}
			</svg>

			{roundOf32Teams.map((team, index) => {
				const point = getPoint(index, 32, 44);

				return (
					<FlagNode
						key={team.team.id}
						id={team.team.id}
						name={team.team.name}
						logo={team.team.logo}
						x={point.x}
						y={point.y}
						isEliminated={isTeamEliminatedInMatch(team.team.id, team.match)}
					/>
				);
			})}
		</div>
	);
}

interface FlagAdjustment {
	scale: number;
	x?: number;
	y?: number;
}

const defaultFlagAdjustment: FlagAdjustment = {
	scale: 1.5,
};

const flagLogoAdjustments: Record<number, FlagAdjustment> = {
	2384: { scale: 1.75, y: -2 },
	1113: { scale: 1.9, y: -4 },
	3: { scale: 1.9, y: 0 },
	5: { scale: 1.75, y: 4 },
	1090: { scale: 1.75, y: -4 },
	20: { scale: 1.9, y: -3 },
	9: { scale: 1.65, y: 1 },
	10: { scale: 1.75, y: 0 },
	16: { scale: 1.75, y: 0 },
};

function FlagNode({ id, name, logo, x, y, isEliminated }: {
	id: number;
	name: string;
	logo: string;
	x: number;
	y: number;
	isEliminated: boolean;
}): React.ReactNode {
	const adjustment = flagLogoAdjustments[id] ?? defaultFlagAdjustment;

	return (
		<div
			className={`absolute h-7 w-7 overflow-hidden rounded-full border border-white/20 bg-slate-800 transition-all ${
				isEliminated ? "opacity-35" : "opacity-100"
			}`}
			style={{
				left: `${x}%`,
				top: `${y}%`,
				transform: "translate(-50%, -50%)",
			}}
		>
			<img
				src={logo}
				alt={name}
				className="h-full w-full max-w-none object-cover"
				style={{
					transform: `scale(${adjustment.scale}) translate(${adjustment.x ?? 0}%, ${adjustment.y ?? 0}%)`,
				}}
			/>
		</div>
	);
}

// const bracketRingRadii = [32, 24, 16, 9];

// function BracketRings(): React.ReactNode {
// 	return (
// 		<>
// 			{bracketRingRadii.map(radius => (
// 				<circle
// 					key={radius}
// 					cx="50"
// 					cy="50"
// 					r={radius}
// 					className="fill-none stroke-slate-700/50"
// 					strokeWidth="0.25"
// 				/>
// 			))}
// 		</>
// 	);
// }

interface BracketLayerConfig {
	key: string;
	pairs: number;
	fromOffset: number;
	spacing: number;
	fromRadius: number;
	toOffset: number;
	toRadius: number;
}

function getLayerItems(layer: BracketLayerConfig, roundOf32: KnockoutMatch[]) {
	return Array.from({ length: layer.pairs }).map((_, pairIndex) => {
		const first = getPoint(pairIndex * layer.spacing + layer.fromOffset, flagCount, layer.fromRadius);
		const second = getPoint(pairIndex * layer.spacing + layer.fromOffset + layer.spacing / 2, flagCount, layer.fromRadius);
		const winner = getPoint(pairIndex * layer.spacing + layer.toOffset, flagCount, layer.toRadius);

		const match = layer.key === "r32" ? roundOf32[pairIndex] : null;
		const firstActive = match != null && isFinal(match) && match.home.winner === true;
		const secondActive = match != null && isFinal(match) && match.away.winner === true;

		return {
			pairIndex,
			first,
			second,
			winner,
			firstActive,
			secondActive,
			nodeActive: firstActive || secondActive,
		};
	});
}

function BracketLayerLines({ layer, roundOf32 }: {
	layer: BracketLayerConfig;
	roundOf32: KnockoutMatch[];
}): React.ReactNode {
	const items = getLayerItems(layer, roundOf32);

	return (
		<>
			{items.map(item => (
				<g key={`${layer.key}-lines-${item.pairIndex}`}>
					<BracketLine from={item.first} to={item.winner} active={item.firstActive} />
					<BracketLine from={item.second} to={item.winner} active={item.secondActive} />
				</g>
			))}
		</>
	);
}

function BracketLayerNodes({ layer, roundOf32 }: {
	layer: BracketLayerConfig;
	roundOf32: KnockoutMatch[];
}): React.ReactNode {
	const items = getLayerItems(layer, roundOf32);

	return (
		<>
			{items.map(item => (
				<BracketNode
					key={`${layer.key}-node-${item.pairIndex}`}
					point={item.winner}
					active={item.nodeActive}
				/>
			))}
		</>
	);
}

function FinalLines(): React.ReactNode {
	const firstFinalist = getPoint(7.5, flagCount, 9);
	const secondFinalist = getPoint(23.5, flagCount, 9);
	const champion = { x: 50, y: 50 };

	return (
		<g>
			<BracketLine from={firstFinalist} to={champion} />
			<BracketLine from={secondFinalist} to={champion} />
			<BracketNode point={champion} />
		</g>
	);
}

function BracketLine({ from, to, active = false }: {
	from: { x: number; y: number };
	to: { x: number; y: number };
	active?: boolean;
}): React.ReactNode {
	return (
		<line
			x1={from.x}
			y1={from.y}
			x2={to.x}
			y2={to.y}
			className={active
				? "stroke-white transition-colors"
				: "stroke-slate-700/30 transition-colors"}
			strokeWidth="0.45"
		/>
	);
}

function BracketNode({ point, active = false }: {
	point: { x: number; y: number };
	active?: boolean;
}): React.ReactNode {
	return (
		<circle
			cx={point.x}
			cy={point.y}
			r="0.8"
			className={active ? "fill-white transition-colors" : "fill-slate-500 transition-colors"}
		/>
	);
}