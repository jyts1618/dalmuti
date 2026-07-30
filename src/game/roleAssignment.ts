import { createDeck, shuffleDeck } from "@/game/deck";
import type { Card, Player, PlayerRole, RoleDraw } from "@/types/game";

export const ROLE_LABELS: Record<PlayerRole, string> = {
  grandDalmuti: "대달무티",
  lesserDalmuti: "소달무티",
  merchant: "상인",
  lesserPeon: "소농노",
  greaterPeon: "대농노",
};

export const ROLE_STRENGTH: Record<PlayerRole, number> = {
  grandDalmuti: 0,
  lesserDalmuti: 1,
  merchant: 2,
  lesserPeon: 3,
  greaterPeon: 4,
};

export function getRolesForPlayerCount(playerCount: number): PlayerRole[] {
  if (playerCount < 4 || playerCount > 8) {
    throw new Error("참여 인원은 4명 이상 8명 이하이어야 합니다.");
  }

  if (playerCount === 4) {
    return ["grandDalmuti", "lesserDalmuti", "lesserPeon", "greaterPeon"];
  }

  return [
    "grandDalmuti",
    "lesserDalmuti",
    ...Array<PlayerRole>(playerCount - 4).fill("merchant"),
    "lesserPeon",
    "greaterPeon",
  ];
}

export function roleOrderValue(player: Pick<Player, "role" | "seatIndex">): number {
  return ROLE_STRENGTH[player.role] * 100 + player.seatIndex;
}

export function sortPlayersByRole(players: Player[]): Player[] {
  return [...players].sort((a, b) => roleOrderValue(a) - roleOrderValue(b));
}

export function sortPlayersBySeat(players: Player[]): Player[] {
  return [...players].sort((a, b) => a.seatIndex - b.seatIndex);
}

function drawValue(card: Card): number {
  return card.rank ?? 13;
}

export function drawInitialRoles(players: Player[], random: () => number = Math.random): {
  players: Player[];
  roleDraws: RoleDraw[];
} {
  const roles = getRolesForPlayerCount(players.length);
  let availableDeck = shuffleDeck(createDeck(), random);
  const drawn = new Map<string, Card>();
  const unsettled = new Set(players.map((player) => player.id));

  while (unsettled.size > 0) {
    const currentIds = [...unsettled];
    unsettled.clear();

    for (const playerId of currentIds) {
      const card = availableDeck.pop();
      if (!card) {
        availableDeck = shuffleDeck(createDeck(), random);
        drawn.clear();
        currentIds.forEach((id) => unsettled.add(id));
        break;
      }
      drawn.set(playerId, card);
    }

    const byValue = new Map<number, string[]>();
    for (const playerId of currentIds) {
      const card = drawn.get(playerId);
      if (!card) continue;
      const value = drawValue(card);
      byValue.set(value, [...(byValue.get(value) ?? []), playerId]);
    }

    for (const ids of byValue.values()) {
      if (ids.length > 1) {
        ids.forEach((id) => {
          drawn.delete(id);
          unsettled.add(id);
        });
      }
    }
  }

  const orderedIds = [...drawn.entries()]
    .sort(([, a], [, b]) => drawValue(a) - drawValue(b))
    .map(([playerId]) => playerId);

  const nextPlayers = orderedIds.map((playerId, index) => {
    const player = players.find((item) => item.id === playerId);
    if (!player) throw new Error("계급 추첨 중 플레이어를 찾지 못했습니다.");
    return { ...player, role: roles[index], seatIndex: index };
  });

  const roleDraws = nextPlayers.map((player) => {
    const card = drawn.get(player.id);
    if (!card) throw new Error("계급 추첨 카드가 누락되었습니다.");
    return { playerId: player.id, card, assignedRole: player.role };
  });

  return { players: nextPlayers, roleDraws };
}

export function assignRolesFromFinishOrder(players: Player[], finishOrder: string[]): Player[] {
  const roles = getRolesForPlayerCount(players.length);

  return finishOrder.map((playerId, index) => {
    const player = players.find((item) => item.id === playerId);
    if (!player) throw new Error("순위에 맞는 플레이어를 찾지 못했습니다.");
    return {
      ...player,
      hand: [],
      role: roles[index],
      seatIndex: index,
      hasPassedLastTurn: false,
      finishOrder: null,
      isFinished: false,
    };
  });
}

export function reverseRolesForGreaterRevolution(players: Player[]): Player[] {
  const sorted = sortPlayersByRole(players);
  const reversedRoles = sorted.map((player) => player.role).reverse();

  return sorted
    .map((player, index) => ({
      ...player,
      role: reversedRoles[index],
      seatIndex: index,
    }))
    .sort((a, b) => a.seatIndex - b.seatIndex);
}
