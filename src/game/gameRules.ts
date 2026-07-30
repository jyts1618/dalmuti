import type { Card, PlayedSet, Player, ValidationResult } from "@/types/game";

export function validateCardSelection(cards: Card[]): ValidationResult {
  if (cards.length === 0) {
    return { valid: false, reason: "카드를 선택하세요." };
  }

  const normalRanks = [...new Set(cards.filter((card) => !card.isJoker).map((card) => card.rank))];

  if (normalRanks.length > 1) {
    return { valid: false, reason: "같은 숫자의 카드만 함께 낼 수 있습니다." };
  }

  return { valid: true, reason: "낼 수 있는 조합입니다." };
}

export function getEffectiveRank(cards: Card[]): number | null {
  const selection = validateCardSelection(cards);
  if (!selection.valid) return null;

  const normalRank = cards.find((card) => !card.isJoker)?.rank;
  return normalRank ?? 13;
}

export function canPlayCards(cards: Card[], currentTrick: PlayedSet | null): ValidationResult {
  const selection = validateCardSelection(cards);
  if (!selection.valid) return selection;

  const effectiveRank = getEffectiveRank(cards);
  if (effectiveRank === null) {
    return { valid: false, reason: "카드 조합을 판정할 수 없습니다." };
  }

  if (!currentTrick) {
    return { valid: true, reason: "새 트릭을 시작할 수 있습니다." };
  }

  if (cards.length !== currentTrick.count) {
    return { valid: false, reason: `${currentTrick.count}장의 카드를 선택해야 합니다.` };
  }

  if (effectiveRank >= currentTrick.rank) {
    return { valid: false, reason: "현재 카드보다 더 강한 카드를 내야 합니다." };
  }

  return { valid: true, reason: "현재 트릭에 낼 수 있습니다." };
}

export function getValidPlays(hand: Card[], currentTrick: PlayedSet | null): Card[][] {
  const results: Card[][] = [];
  const normalRanks = [...new Set(hand.filter((card) => !card.isJoker).map((card) => card.rank))]
    .filter((rank): rank is number => typeof rank === "number")
    .sort((a, b) => a - b);
  const jokers = hand.filter((card) => card.isJoker);

  for (const rank of normalRanks) {
    const rankCards = hand.filter((card) => card.rank === rank);
    const maxCount = rankCards.length + jokers.length;
    const wantedCounts = currentTrick ? [currentTrick.count] : Array.from({ length: maxCount }, (_, index) => index + 1);

    for (const count of wantedCounts) {
      if (count > maxCount) continue;

      const naturalCount = Math.min(rankCards.length, count);
      const jokerCount = count - naturalCount;
      const cards = [...rankCards.slice(0, naturalCount), ...jokers.slice(0, jokerCount)];

      if (cards.length === count && canPlayCards(cards, currentTrick).valid) {
        results.push(cards);
      }
    }
  }

  if (!currentTrick) {
    for (let count = 1; count <= jokers.length; count += 1) {
      const cards = jokers.slice(0, count);
      if (canPlayCards(cards, null).valid) {
        results.push(cards);
      }
    }
  }

  return results;
}

export function getNextActivePlayer(players: Player[], currentPlayerId: string | null): Player | null {
  const activePlayers = players.filter((player) => !player.isFinished && player.hand.length > 0);
  if (activePlayers.length === 0) return null;

  if (!currentPlayerId) return activePlayers[0];

  const currentIndex = players.findIndex((player) => player.id === currentPlayerId);
  for (let offset = 1; offset <= players.length; offset += 1) {
    const candidate = players[(currentIndex + offset + players.length) % players.length];
    if (!candidate.isFinished && candidate.hand.length > 0) return candidate;
  }

  return null;
}

export function isTrickComplete(players: Player[], consecutivePassCount: number, currentTrick: PlayedSet | null): boolean {
  if (!currentTrick) return false;
  const activeCount = players.filter((player) => !player.isFinished && player.hand.length > 0).length;
  return activeCount > 1 && consecutivePassCount >= activeCount - 1;
}

export function calculateFinishOrder(players: Player[], existingOrder: string[]): string[] {
  const order = [...existingOrder];

  for (const player of players) {
    if ((player.isFinished || player.hand.length === 0) && !order.includes(player.id)) {
      order.push(player.id);
    }
  }

  const remaining = players.filter((player) => !order.includes(player.id));
  if (remaining.length === 1) {
    order.push(remaining[0].id);
  }

  return order;
}

export function getSelectedCards(hand: Card[], cardIds: string[]): Card[] {
  const cardById = new Map(hand.map((card) => [card.id, card]));
  return cardIds.map((id) => cardById.get(id)).filter((card): card is Card => Boolean(card));
}
