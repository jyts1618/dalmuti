import { sortHand } from "@/game/deck";
import type { Card, Player, PlayerRole } from "@/types/game";

type TaxExchange = {
  fromRole: PlayerRole;
  toRole: PlayerRole;
  count: number;
};

const TAX_EXCHANGES: TaxExchange[] = [
  { fromRole: "greaterPeon", toRole: "grandDalmuti", count: 2 },
  { fromRole: "lesserPeon", toRole: "lesserDalmuti", count: 1 },
];

function removeCards(hand: Card[], cardIds: string[]): Card[] {
  const ids = new Set(cardIds);
  return hand.filter((card) => !ids.has(card.id));
}

export function getStrongestTaxCards(hand: Card[], count: number): Card[] {
  return sortHand(hand).filter((card) => !card.isJoker).slice(0, count);
}

export function getWeakestReturnCards(hand: Card[], count: number): Card[] {
  return [...hand]
    .sort((a, b) => {
      const aValue = a.rank ?? 99;
      const bValue = b.rank ?? 99;
      const rankDiff = bValue - aValue;
      return rankDiff === 0 ? a.id.localeCompare(b.id) : rankDiff;
    })
    .slice(0, count);
}

export function getRequiredReturnCount(players: Player[], humanPlayerId: string): number {
  const human = players.find((player) => player.id === humanPlayerId);
  if (!human) return 0;
  if (human.role === "grandDalmuti") return players.some((player) => player.role === "greaterPeon") ? 2 : 0;
  if (human.role === "lesserDalmuti") return players.some((player) => player.role === "lesserPeon") ? 1 : 0;
  return 0;
}

export function processTaxation(players: Player[], humanReturnCardIds: string[] = []): Player[] {
  const nextPlayers = players.map((player) => ({ ...player, hand: [...player.hand] }));

  for (const exchange of TAX_EXCHANGES) {
    const from = nextPlayers.find((player) => player.role === exchange.fromRole);
    const to = nextPlayers.find((player) => player.role === exchange.toRole);
    if (!from || !to) continue;

    const cards = getStrongestTaxCards(from.hand, exchange.count);
    from.hand = removeCards(from.hand, cards.map((card) => card.id));
    to.hand = sortHand([...to.hand, ...cards]);
  }

  for (const exchange of TAX_EXCHANGES) {
    const highRolePlayer = nextPlayers.find((player) => player.role === exchange.toRole);
    const lowRolePlayer = nextPlayers.find((player) => player.role === exchange.fromRole);
    if (!highRolePlayer || !lowRolePlayer) continue;

    const selected =
      highRolePlayer.type === "human"
        ? highRolePlayer.hand.filter((card) => humanReturnCardIds.includes(card.id)).slice(0, exchange.count)
        : getWeakestReturnCards(highRolePlayer.hand, exchange.count);

    if (selected.length !== exchange.count) {
      throw new Error(`${highRolePlayer.name}의 세금 반환 카드 수가 올바르지 않습니다.`);
    }

    highRolePlayer.hand = removeCards(highRolePlayer.hand, selected.map((card) => card.id));
    lowRolePlayer.hand = sortHand([...lowRolePlayer.hand, ...selected]);
  }

  return nextPlayers.map((player) => ({ ...player, hand: sortHand(player.hand) }));
}
