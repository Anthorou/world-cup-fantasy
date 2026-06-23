"use client";

import { useEffect, useRef, useState } from "react";

const kPullDistance = 90;

export default function PullToRefresh(): React.ReactNode {
	const startY = useRef<number | null>(null);
	const [pulling, setPulling] = useState(false);

	useEffect(() => {
		function onTouchStart(event: TouchEvent) {
			if (window.scrollY === 0) {
				startY.current = event.touches[0].clientY;
			}
		}

		function onTouchMove(event: TouchEvent) {
			if (startY.current == null || window.scrollY !== 0) {
				return;
			}

			const distance = event.touches[0].clientY - startY.current;

			if (distance > 20) {
				event.preventDefault();
				setPulling(distance > kPullDistance);
			}
		}

		function onTouchEnd(event: TouchEvent) {
			if (startY.current == null) {
				return;
			}

			const distance = event.changedTouches[0].clientY - startY.current;

			startY.current = null;
			setPulling(false);

			if (distance > kPullDistance) {
				window.location.reload();
			}
		}

		window.addEventListener("touchstart", onTouchStart, { passive: true });
		window.addEventListener("touchmove", onTouchMove, { passive: false });
		window.addEventListener("touchend", onTouchEnd);

		return () => {
			window.removeEventListener("touchstart", onTouchStart);
			window.removeEventListener("touchmove", onTouchMove);
			window.removeEventListener("touchend", onTouchEnd);
		};
	}, []);

	return pulling ? (
		<div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200 shadow-lg">
			Release to refresh
		</div>
	) : null;
}