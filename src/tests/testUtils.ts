import { sortHand } from "@/game/deck";
import type { Card, Player, PlayerRole } from "@/types/game";

export function card(id: string, rank: number | null): Card {
  return {
    id,
    rank,
    name: rank === null ? "광대" : `${rank}`,
    isJoker: rank === null,
  };
}

export function player(id: string, role: PlayerRole, hand: Card[] = [], seatIndex = 0, type: "human" | "ai" = "ai"): Player {
  return {
    id,
    name: id,
    type,
    hand: sortHand(hand),
    role,
    seatIndex,
    hasPassedLastTurn: false,
    finishOrder: null,
    isFinished: false,
  };
}
