"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";

const STORAGE_KEY = "cryptogotchi-mute";

// ZzFX sound parameter arrays — each is a tuple of synth params
// Designed via https://killedbyapixel.github.io/ZzFX/
const SOUNDS = {
  coinEarn:     [,,537,.02,.07,.17,1,.8,-9.2,,,,.06,,,,,.65,.04],
  feed:         [,,262,.05,.15,.4,,1.5,,,,,.1,,,,,.7,.08],
  play:         [,,784,.01,.04,.2,2,1.5,,,587,.04,.01,,,,,.5,.02],
  sleep:        [,,175,.08,.3,.6,,1.2,-2,,,,,,,,.1,.6,.1,.1],
  medicine:     [,,392,.02,.1,.3,1,.6,,,294,.08,,,,,,,.05],
  levelUp:      [,,523,.05,.3,.5,1,.7,,,698,.05,.02,,,,,.8,.06],
  death:        [,,131,.03,.5,.8,,2.5,-1,,,,,,,,,.3,.3,.1],
  revive:       [,,523,.02,.2,.4,1,.5,,,784,.06,,,,,,1,.05],
  customerArrival: [,,880,.01,.02,.1,2,1.5,,,,,,,,,,.4,.01],
} as const;

type SoundName = keyof typeof SOUNDS;

// Lazy-loaded zzfx function reference
let zzfxFn: ((...p: (number | undefined)[]) => AudioBufferSourceNode) | null = null;

async function loadZzfx() {
  if (zzfxFn) return zzfxFn;
  try {
    const mod = await import("zzfx");
    zzfxFn = mod.zzfx;
    return zzfxFn;
  } catch {
    return null;
  }
}

type MuteAction = { type: "SET"; muted: boolean } | { type: "TOGGLE" };

function muteReducer(state: boolean, action: MuteAction): boolean {
  switch (action.type) {
    case "SET":
      return action.muted;
    case "TOGGLE":
      return !state;
    default:
      return state;
  }
}

export function useAudio() {
  const [muted, dispatch] = useReducer(muteReducer, true); // default muted, hydrate from storage
  const hydrateRef = useRef(false);

  useEffect(() => {
    if (hydrateRef.current) return;
    hydrateRef.current = true;

    // Check prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      dispatch({ type: "SET", muted: true });
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      dispatch({ type: "SET", muted: stored === "true" });
    } else {
      dispatch({ type: "SET", muted: false }); // unmuted by default if no preference
    }
  }, []);

  const toggleMute = useCallback(() => {
    dispatch({ type: "TOGGLE" });
    // Persist after toggle (read current from reducer isn't available here, use storage)
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const next = current === "true" ? "false" : current === "false" ? "true" : "true";
      localStorage.setItem(STORAGE_KEY, next);
    } catch { /* */ }
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    if (!hydrateRef.current) return;
    try { localStorage.setItem(STORAGE_KEY, String(muted)); } catch { /* */ }
  }, [muted]);

  const play = useCallback(async (name: SoundName) => {
    if (typeof window === "undefined") return;
    // Read muted from DOM storage directly to avoid stale closure
    const isMuted = localStorage.getItem(STORAGE_KEY) === "true";
    if (isMuted) return;

    const fn = await loadZzfx();
    if (!fn) return;
    try {
      const params = SOUNDS[name];
      fn(...(params as unknown as (number | undefined)[]));
    } catch {
      // AudioContext may not be available
    }
  }, []);

  return { muted, toggleMute, play };
}

export type { SoundName };
