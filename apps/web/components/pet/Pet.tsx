"use client";

import type { PetMood, BalanceState } from "@cryptogotchi/shared";

interface SpriteConfig {
  src: string;
  frames: number;
}

function getSpriteConfig(mood: PetMood, balanceState: BalanceState): SpriteConfig {
  if (balanceState === "dead") {
    return { src: "/sprites/dead.png", frames: 1 };
  }

  switch (mood) {
    case "happy":
    case "excited":
      return { src: "/sprites/happy.png", frames: 4 };
    case "neutral":
      return { src: "/sprites/idle.png", frames: 2 };
    case "sad":
    case "hungry":
      return { src: "/sprites/sad.png", frames: 2 };
    case "sick":
      return { src: "/sprites/sleeping.png", frames: 2 };
    default:
      return { src: "/sprites/idle.png", frames: 2 };
  }
}

function getBreatheClass(mood: PetMood, balanceState: BalanceState): string {
  if (balanceState === "dead") return "";
  switch (mood) {
    case "happy":
    case "excited":
    case "hungry":
      return "animate-breathe-fast";
    case "sad":
    case "sick":
      return "animate-breathe-slow";
    default:
      return "animate-breathe";
  }
}

interface PetProps {
  mood: PetMood;
  balanceState: BalanceState;
  size?: number;
}

export default function Pet({ mood, balanceState, size = 160 }: PetProps) {
  const { src, frames } = getSpriteConfig(mood, balanceState);
  const animClass =
    frames === 1
      ? ""
      : frames === 2
        ? "animate-sprite-2"
        : frames === 3
          ? "animate-sprite-3"
          : "animate-sprite-4";

  const breatheClass = getBreatheClass(mood, balanceState);

  const isDead = balanceState === "dead";

  return (
    <div
      className={`${breatheClass} pixel-art ${animClass} ${isDead ? "rounded-lg" : ""}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${src})`,
        backgroundSize: `${frames * 100}% 100%`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 0",
        ...(isDead ? { filter: "grayscale(1) contrast(0.7) brightness(1.1)", mixBlendMode: "multiply" as const } : {}),
      }}
      role="img"
      aria-label={`Pet is ${mood}`}
    />
  );
}
