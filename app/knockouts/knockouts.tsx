const rounds = {
	left: [
		{ title: "R32", matches: 8 },
		{ title: "R16", matches: 4 },
		{ title: "QF", matches: 2 },
		{ title: "SF", matches: 1 },
	],
	right: [
		{ title: "SF", matches: 1 },
		{ title: "QF", matches: 2 },
		{ title: "R16", matches: 4 },
		{ title: "R32", matches: 8 },
	],
};

export function Knockouts(): React.ReactNode {
	return (
		<main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
			<div>
				<h1 className="text-3xl font-bold">Knockout</h1>
				<p className="text-sm text-slate-400">
					Bracket will update automatically when knockout fixtures become available.
				</p>
			</div>

			{/* Desktop */}
			<div className="hidden lg:grid lg:grid-cols-[repeat(4,minmax(0,1fr))_90px_repeat(4,minmax(0,1fr))] lg:items-center lg:gap-2">
				{rounds.left.map(round => (
					<BracketRound
						key={round.title}
						title={round.title}
						matches={round.matches}
						compact={false}
					/>
				))}

				<FinalColumn compact={false} />

				{rounds.right.map(round => (
					<BracketRound
						key={round.title}
						title={round.title}
						matches={round.matches}
						compact={false}
					/>
				))}
			</div>

			{/* Mobile */}
			<div className="space-y-4 lg:hidden">
				<MobileRound title="Round of 32" matches={16} />
				<MobileRound title="Round of 16" matches={8} />
				<MobileRound title="Quarter-finals" matches={4} />
				<MobileRound title="Semi-finals" matches={2} />
				<MobileRound title="Final" matches={1} />

				<div className="rounded-xl border border-amber-400/30 bg-slate-900 p-3">
					<p className="mb-2 text-center text-xs font-semibold text-amber-300">
						Winner
					</p>

					<BracketTeam compact={false} />
				</div>
			</div>
		</main>
	);
}

function FinalColumn({ compact }: { compact: boolean }): React.ReactNode {
	return (
		<div className={compact ? "space-y-2" : "space-y-3"}>
			<h2 className="text-center text-[10px] font-semibold text-slate-400 sm:text-xs">
				Final
			</h2>

			<BracketMatch compact={compact} />

			<div className={compact
				? "rounded-md border border-amber-400/30 bg-slate-900 p-1"
				: "rounded-lg border border-amber-400/30 bg-slate-900 p-2"
			}>
				<p className="mb-1 text-center text-[9px] font-semibold text-amber-300">
					Winner
				</p>

				<BracketTeam compact={compact} />
			</div>
		</div>
	);
}

function BracketRound({
	title,
	matches,
	compact,
}: {
	title: string;
	matches: number;
	compact: boolean;
}): React.ReactNode {
	return (
		<div className={compact ? "space-y-1" : "space-y-2"}>
			<h2 className="text-center text-[10px] font-semibold text-slate-400 sm:text-xs">
				{title}
			</h2>

			<div className={compact
				? "flex min-h-[420px] flex-col justify-around gap-1"
				: "flex min-h-[620px] flex-col justify-around gap-2"
			}>
				{Array.from({ length: matches }).map((_, index) => (
					<BracketMatch key={index} compact={compact} />
				))}
			</div>
		</div>
	);
}

function BracketMatch({ compact }: { compact: boolean }): React.ReactNode {
	return (
		<div className={compact
			? "rounded-md border border-white/10 bg-slate-900 p-1"
			: "rounded-lg border border-white/10 bg-slate-900 p-2"
		}>
			<BracketTeam compact={compact} />
			<div className={compact ? "my-1 border-t border-white/10" : "my-1 border-t border-white/10"} />
			<BracketTeam compact={compact} />
		</div>
	);
}

function BracketTeam({ compact }: { compact: boolean }): React.ReactNode {
	if (compact) {
		return (
			<div className="flex items-center justify-between gap-1">
				<div className="h-3 w-3 shrink-0 rounded-full bg-slate-800 sm:h-4 sm:w-4" />
				<span className="text-[10px] font-bold text-slate-500">-</span>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-between gap-2">
			<div className="flex min-w-0 items-center gap-2">
				<div className="h-5 w-5 shrink-0 rounded-full bg-slate-800" />
				<p className="truncate text-xs font-medium">TBD</p>
			</div>

			<span className="text-xs font-bold text-slate-500">-</span>
		</div>
	);
}

function MobileRound({
	title,
	matches,
}: {
	title: string;
	matches: number;
}): React.ReactNode {
	return (
		<section className="space-y-3">
			<h2 className="text-sm font-semibold text-slate-400">
				{title}
			</h2>

			<div className="grid grid-cols-1 gap-2">
				{Array.from({ length: matches }).map((_, index) => (
					<BracketMatch key={index} compact={false} />
				))}
			</div>
		</section>
	);
}