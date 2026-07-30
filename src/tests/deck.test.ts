import { describe, expect, it } from "vitest";

import { createDeck, shuffleDeck } from "@/game/deck";
import { dealCards } from "@/game/gameReducer";
import { player } from "@/tests/testUtils";

describe("deck", () => {
  it("creates the official 80 card deck", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(80);
    expect(deck.filter((card) => card.isJoker)).toHaveLength(2);

    for (let rank = 1; rank <= 12; rank += 1) {
      expect(deck.filter((card) => card.rank === rank)).toHaveLength(rank);
    }
  });

  it("keeps every card after shuffling", () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck, () => 0.42);
    expect(new Set(shuffled.map((card) => card.id))).toEqual(new Set(deck.map((card) => card.id)));
    expect(shuffled).toHaveLength(deck.length);
  });
});

describe("dealing", () => {
  it("deals every card to exactly one player", () => {
    const players = [
      player("a", "grandDalmuti", [], 0),
      player("b", "lesserDalmuti", [], 1),
      player("c", "merchant", [], 2),
      player("d", "lesserPeon", [], 3),
      player("e", "greaterPeon", [], 4),
    ];
    const dealt = dealCards(players, () => 0.2);
    const allCards = dealt.flatMap((item) => item.hand);

    expect(allCards).toHaveLength(80);
    expect(new Set(allCards.map((item) => item.id))).toHaveLength(80);
  });

  it("keeps player card count difference at most one", () => {
    const players = [
      player("a", "grandDalmuti", [], 0),
      player("b", "lesserDalmuti", [], 1),
      player("c", "merchant", [], 2),
      player("d", "merchant", [], 3),
      player("e", "lesserPeon", [], 4),
      player("f", "greaterPeon", [], 5),
    ];
    const counts = dealCards(players, () => 0.3).map((item) => item.hand.length);

    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    expect(counts[0]).toBe(14);
    expect(counts[1]).toBe(14);
  });
});
