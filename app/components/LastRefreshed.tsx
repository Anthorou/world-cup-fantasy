"use client";

import { useEffect, useState } from "react";
import { useApp } from "../contexts/worldCupContext";

interface LastRefreshedProps {
	lastRefreshed?: string;
}

function formatLastRefreshed(lastRefreshed: string, now: number): string {
	const refreshedDate = new Date(lastRefreshed);
	const diffMinutes = Math.floor((now - refreshedDate.getTime()) / 1000 / 60);

	if (diffMinutes < 1) return "Updated just now";
	if (diffMinutes === 1) return "Updated 1 minute ago";
	if (diffMinutes < 60) return `Updated ${diffMinutes} minutes ago`;

	const diffHours = Math.floor(diffMinutes / 60);

	if (diffHours === 1) return "Updated 1 hour ago";

	return `Updated ${diffHours} hours ago`;
}

export function LastRefreshed({ lastRefreshed }: LastRefreshedProps): React.ReactNode {
	const app = useApp();
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			setNow(Date.now());
		}, 60_000);

		return () => window.clearInterval(intervalId);
	}, []);

	const refreshedAt = lastRefreshed ?? app.lastRefreshed;

	return (
		<p className="text-center text-sm text-slate-400">
			{formatLastRefreshed(refreshedAt, now)}
		</p>
	);
}