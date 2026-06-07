import { useEffect, useState } from "react";

export function useReducedMotion(force?: boolean): boolean {
  const [systemPrefers, setSystemPrefers] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemPrefers(mq.matches);
    const onChange = () => setSystemPrefers(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return force === true ? true : systemPrefers;
}
