"use client";

import { useEffect, useRef } from "react";

export default function PullToRefresh(): React.ReactNode {
	const startY = useRef<number | null>(null);

	useEffect(() => {
		function onTouchStart(event: TouchEvent) {
			if (window.scrollY === 0) {
				startY.current = event.touches[0].clientY;
			}
		}

		function onTouchEnd(event: TouchEvent) {
			if (startY.current == null) {
				return ;
			}

			const endY = event.changedTouches[0].clientY;
			const distance = endY - startY.current;

			if (window.scrollY === 0 && distance > 100) {
				window.location.reload();
			}

			startY.current == null;
		}

		window.addEventListener("touchstart", onTouchStart);
		window.addEventListener("touchend", onTouchEnd);

		return () => {
			window.removeEventListener("touchstart", onTouchStart);
			window.removeEventListener("touchend", onTouchEnd);
		};
	}, []);

	return null;
}