import type { Player, RevolutionType } from "@/types/game";

export function hasTwoJokers(player: Player): boolean {
  return player.hand.filter((card) => card.isJoker).length === 2;
}

export function getRevolutionCandidate(players: Player[]): Player | null {
  return players.find(hasTwoJokers) ?? null;
}

export function getRevolutionType(player: Player | null): RevolutionType {
  if (!player) return "none";
  return player.role === "greaterPeon" ? "greater" : "normal";
}
