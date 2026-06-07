import { useCallback, useRef } from "react";

export function useScroll() {
  const sideRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  const onTimelineScroll = useCallback(() => {
    if (syncing.current) return;
    const tl = timelineRef.current;
    const side = sideRef.current;
    const header = headerRef.current;
    if (!tl) return;
    syncing.current = true;
    if (side && side.scrollTop !== tl.scrollTop) side.scrollTop = tl.scrollTop;
    if (header && header.scrollLeft !== tl.scrollLeft) header.scrollLeft = tl.scrollLeft;
    syncing.current = false;
  }, []);

  const onSideScroll = useCallback(() => {
    if (syncing.current) return;
    const tl = timelineRef.current;
    const side = sideRef.current;
    if (!tl || !side) return;
    syncing.current = true;
    if (tl.scrollTop !== side.scrollTop) tl.scrollTop = side.scrollTop;
    syncing.current = false;
  }, []);

  return { sideRef, timelineRef, headerRef, onTimelineScroll, onSideScroll };
}
