"use client";

import { RefObject, useEffect, useRef } from "react";

export function usePullToRefresh(ref: RefObject<HTMLElement | null>, onRefresh: () => void | Promise<void>, enabled = true) {
  const startY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    const target = element;

    function onTouchStart(event: TouchEvent) {
      if (target.scrollTop > 0) return;
      startY.current = event.touches[0]?.clientY ?? 0;
      pulling.current = true;
    }

    function onTouchEnd(event: TouchEvent) {
      if (!pulling.current) return;
      const endY = event.changedTouches[0]?.clientY ?? startY.current;
      const delta = endY - startY.current;
      pulling.current = false;
      if (delta > 72 && target.scrollTop <= 0) {
        void onRefresh();
      }
    }

    target.addEventListener("touchstart", onTouchStart, { passive: true });
    target.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      target.removeEventListener("touchstart", onTouchStart);
      target.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, onRefresh, ref]);
}
