"use client";

import { useEffect, useRef, useState } from "react";

const kPullDistance = 90;

export default function PullToRefresh(): React.ReactNode {
	const startY = useRef<number | null>(null);
	const [pulling, setPulling] = useState(false);

	useEffect(() => {
		function getScrollContainer() {
			return document.getElementById("app-scroll-container");
		}

		function isAtTop(): boolean {
			const scrollContainer = getScrollContainer();

			return scrollContainer?.scrollTop === 0;
		}

		function onTouchStart(event: TouchEvent) {
			if (isAtTop()) {
				startY.current = event.touches[0].clientY;
			}
		}

		function onTouchMove(event: TouchEvent) {
			if (startY.current == null || !isAtTop()) {
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

		const scrollContainer = getScrollContainer();

		scrollContainer?.addEventListener("touchstart", onTouchStart, { passive: true });
		scrollContainer?.addEventListener("touchmove", onTouchMove, { passive: false });
		scrollContainer?.addEventListener("touchend", onTouchEnd);

		return () => {
			scrollContainer?.removeEventListener("touchstart", onTouchStart);
			scrollContainer?.removeEventListener("touchmove", onTouchMove);
			scrollContainer?.removeEventListener("touchend", onTouchEnd);
		};
	}, []);

	return pulling ? (
		<div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200 shadow-lg">
			Release to refresh
		</div>
	) : null;
}