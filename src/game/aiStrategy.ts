import { describeCards } from "@/game/deck";
import { getEffectiveRank, getValidPlays } from "@/game/gameRules";
import type { AiAction, AiDifficulty, Card, PlayedSet, Player } from "@/types/game";

export function getAllValidCombinations(hand: Card[], currentTrick: PlayedSet | null): Card[][] {
  return getValidPlays(hand, currentTrick);
}

function playSortValue(cards: Card[]): number {
  return getEffectiveRank(cards) ?? 99;
}

function jokerCount(cards: Card[]): number {
  return cards.filter((card) => card.isJoker).length;
}

export function shouldUseJoker(cards: Card[], alternatives: Card[][]): boolean {
  if (jokerCount(cards) === 0) return false;

  const rank = playSortValue(cards);
  return !alternatives.some(
    (alternative) =>
      alternative.length === cards.length &&
      playSortValue(alternative) === rank &&
      jokerCount(alternative) === 0,
  );
}

export function selectLeadPlay(hand: Card[]): Card[] | null {
  const plays = getAllValidCombinations(hand, null);
  if (plays.length === 0) return null;

  const withoutJoker = plays.filter((cards) => jokerCount(cards) === 0);
  const candidates = withoutJoker.length > 0 ? withoutJoker : plays;

  return [...candidates].sort((a, b) => {
    const rankDiff = playSortValue(b) - playSortValue(a);
    if (rankDiff !== 0) return rankDiff;
    return b.length - a.length;
  })[0];
}

export function selectEasyLeadPlay(hand: Card[]): Card[] | null {
  const plays = getAllValidCombinations(hand, null);
  if (plays.length === 0) return null;

  return [...plays].sort((a, b) => {
    const rankDiff = playSortValue(b) - playSortValue(a);
    if (rankDiff !== 0) return rankDiff;
    return a.length - b.length;
  })[0];
}

export function selectHardLeadPlay(hand: Card[]): Card[] | null {
  const plays = getAllValidCombinations(hand, null);
  if (plays.length === 0) return null;

  const finishingPlays = plays.filter((cards) => cards.length === hand.length);
  if (finishingPlays.length > 0) return finishingPlays[0];

  const withoutJoker = plays.filter((cards) => jokerCount(cards) === 0);
  const candidates = withoutJoker.length > 0 ? withoutJoker : plays;

  return [...candidates].sort((a, b) => {
    const rankDiff = playSortValue(b) - playSortValue(a);
    if (rankDiff !== 0) return rankDiff;
    return b.length - a.length;
  })[0];
}

export function selectResponsePlay(hand: Card[], currentTrick: PlayedSet): Card[] | null {
  const plays = getAllValidCombinations(hand, currentTrick);
  if (plays.length === 0) return null;

  const exactNatural = plays.filter((cards) => jokerCount(cards) === 0);
  const candidates = exactNatural.length > 0 ? exactNatural : plays;

  return [...candidates].sort((a, b) => {
    const rankDiff = playSortValue(b) - playSortValue(a);
    if (rankDiff !== 0) return rankDiff;
    return jokerCount(a) - jokerCount(b);
  })[0];
}

export function selectEasyResponsePlay(hand: Card[], currentTrick: PlayedSet): Card[] | null {
  const plays = getAllValidCombinations(hand, currentTrick);
  if (plays.length === 0) return null;

  return [...plays].sort((a, b) => {
    const jokerDiff = jokerCount(b) - jokerCount(a);
    if (jokerDiff !== 0) return jokerDiff;
    return playSortValue(a) - playSortValue(b);
  })[0];
}

export function selectHardResponsePlay(hand: Card[], currentTrick: PlayedSet): Card[] | null {
  const plays = getAllValidCombinations(hand, currentTrick);
  if (plays.length === 0) return null;

  const finishingPlays = plays.filter((cards) => cards.length === hand.length);
  if (finishingPlays.length > 0) return finishingPlays[0];

  const naturalPlays = plays.filter((cards) => jokerCount(cards) === 0);
  const candidates = naturalPlays.length > 0 ? naturalPlays : plays;

  return [...candidates].sort((a, b) => {
    const rankDiff = playSortValue(b) - playSortValue(a);
    if (rankDiff !== 0) return rankDiff;
    return jokerCount(a) - jokerCount(b);
  })[0];
}

function selectByDifficulty(player: Player, currentTrick: PlayedSet | null, difficulty: AiDifficulty): Card[] | null {
  if (!currentTrick) {
    if (difficulty === "easy") return selectEasyLeadPlay(player.hand);
    if (difficulty === "hard") return selectHardLeadPlay(player.hand);
    return selectLeadPlay(player.hand);
  }

  if (difficulty === "easy") return selectEasyResponsePlay(player.hand, currentTrick);
  if (difficulty === "hard") return selectHardResponsePlay(player.hand, currentTrick);
  return selectResponsePlay(player.hand, currentTrick);
}

export function decideAiAction(player: Player, currentTrick: PlayedSet | null, difficulty: AiDifficulty = "normal"): AiAction {
  const cards = selectByDifficulty(player, currentTrick, difficulty);

  if (!cards) {
    return { kind: "pass", message: `${player.name}가 패스했습니다.` };
  }

  const leadPrefix = currentTrick ? "" : `${player.name}가 새로운 트릭을 시작합니다. `;
  return {
    kind: "play",
    cards,
    message: `${leadPrefix}${player.name}가 ${describeCards(cards)}을 냈습니다.`,
  };
}
