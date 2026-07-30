import type { Card } from "@/types/game";

export const CARD_NAMES: Record<number, string> = {
  1: "대달무티",
  2: "대주교",
  3: "원수",
  4: "남작부인",
  5: "수녀원장",
  6: "기사",
  7: "재봉사",
  8: "석공",
  9: "요리사",
  10: "양치기",
  11: "광부",
  12: "농노",
};

export const JOKER_NAME = "광대";

export function createDeck(): Card[] {
  const deck: Card[] = [];

  for (let rank = 1; rank <= 12; rank += 1) {
    for (let index = 1; index <= rank; index += 1) {
      deck.push({
        id: `rank-${rank}-${index}`,
        rank,
        name: CARD_NAMES[rank],
        isJoker: false,
      });
    }
  }

  deck.push(
    { id: "joker-1", rank: null, name: JOKER_NAME, isJoker: true },
    { id: "joker-2", rank: null, name: JOKER_NAME, isJoker: true },
  );

  if (deck.length !== 80) {
    throw new Error("달무티 덱은 반드시 80장이어야 합니다.");
  }

  return deck;
}

export function shuffleDeck<T>(items: T[], random: () => number = Math.random): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function cardSortValue(card: Card): number {
  return card.rank ?? 99;
}

export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    const rankDiff = cardSortValue(a) - cardSortValue(b);
    return rankDiff === 0 ? a.id.localeCompare(b.id) : rankDiff;
  });
}

export function describeCards(cards: Card[]): string {
  const rank = cards.find((card) => !card.isJoker)?.rank ?? null;

  if (rank === null) {
    return `조커 ${cards.length}장`;
  }

  const jokerCount = cards.filter((card) => card.isJoker).length;
  const suffix = jokerCount > 0 ? `, 조커 ${jokerCount}장 포함` : "";
  return `${rank}번 카드 ${cards.length}장${suffix}`;
}
