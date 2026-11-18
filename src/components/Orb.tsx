"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import type { OrbProps } from "./InteractiveOrb";

type OrbState = "idle" | "listening" | "thinking" | "speaking" | "error";

const palette = ["#9c43fe", "#4cc2e9", "#101499"];

export function Orb({ state = "idle", hero = false }: { state?: OrbState; hero?: boolean }) {
  const [ready, setReady] = useState(false);
  const [InteractiveOrb, setInteractiveOrb] = useState<ComponentType<OrbProps> | null>(null);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const loadOrb = useCallback(() => {
    if (loadingRef.current || !window.matchMedia("(min-width: 761px) and (prefers-reduced-motion: no-preference)").matches) return;
    loadingRef.current = true;
    import("./InteractiveOrb")
      .then(module => { if (mountedRef.current) setInteractiveOrb(() => module.default); })
      .catch(() => { if (mountedRef.current) setReady(false); })
      .finally(() => { loadingRef.current = false; });
  }, []);
  useEffect(() => {
    mountedRef.current = true;
    const media = window.matchMedia("(min-width: 761px) and (prefers-reduced-motion: no-preference)");
    const timer = window.setTimeout(loadOrb, 4_500);
    const onChange = () => {
      if (media.matches) loadOrb();
      else { setInteractiveOrb(null); setReady(false); }
    };
    media.addEventListener("change", onChange);
    return () => { mountedRef.current = false; window.clearTimeout(timer); media.removeEventListener("change", onChange); };
  }, [loadOrb]);
  const onReady = useCallback(() => setReady(true), []);
  const onUnavailable = useCallback(() => setReady(false), []);
  const active = state === "listening" || state === "thinking" || state === "speaking";

  return <div className={`orb-wrap ${hero ? "orb-wrap--hero" : ""} orb-wrap--${state} ${ready ? "orb-wrap--rendered" : ""}`} aria-hidden="true" onPointerEnter={hero ? loadOrb : undefined}>
    <div className="orb-fallback" />
    {InteractiveOrb && <InteractiveOrb
      colors={palette}
      hoverIntensity={1}
      trail={1}
      rotateOnHover={hero}
      followCursor={hero}
      hue={0}
      size={1}
      glow={1}
      bleed={1}
      wobble={1}
      highlight={1}
      tiltX={0}
      tiltY={0}
      speed={state === "thinking" ? 1.35 : state === "speaking" ? 1.2 : 1}
      dpr={1.5}
      backgroundColor="#000000"
      forceHoverState={active}
      clickPulse={hero}
      intro={hero}
      onReady={onReady}
      onUnavailable={onUnavailable}
    />}
    <div className="orb-floor" />
  </div>;
}
