import { describe, expect, it } from "vitest";

import { decideAiAction, selectResponsePlay } from "@/game/aiStrategy";
import { card, player } from "@/tests/testUtils";

describe("AI strategy", () => {
  it("never submits when no valid cards exist", () => {
    const ai = player("ai", "merchant", [card("10", 10)], 0);
    const action = decideAiAction(ai, { cards: [card("5", 5)], rank: 5, count: 1, playedById: "human" });

    expect(action.kind).toBe("pass");
  });

  it("chooses the weakest valid response", () => {
    const hand = [card("4", 4), card("7", 7), card("8", 8)];
    const play = selectResponsePlay(hand, { cards: [card("9", 9)], rank: 9, count: 1, playedById: "human" });

    expect(play?.[0].rank).toBe(8);
  });

  it("avoids unnecessary joker use", () => {
    const hand = [card("6a", 6), card("6b", 6), card("j", null)];
    const play = selectResponsePlay(hand, { cards: [card("8a", 8), card("8b", 8)], rank: 8, count: 2, playedById: "human" });

    expect(play?.some((item) => item.isJoker)).toBe(false);
  });

  it("easy AI spends stronger cards more readily", () => {
    const ai = player("ai", "merchant", [card("4", 4), card("8", 8)], 0);
    const action = decideAiAction(ai, { cards: [card("9", 9)], rank: 9, count: 1, playedById: "human" }, "easy");

    expect(action.kind).toBe("play");
    if (action.kind === "play") {
      expect(action.cards[0].rank).toBe(4);
    }
  });

  it("hard AI prioritizes a finishing play", () => {
    const ai = player("ai", "merchant", [card("6a", 6), card("6b", 6)], 0);
    const action = decideAiAction(ai, { cards: [card("8a", 8), card("8b", 8)], rank: 8, count: 2, playedById: "human" }, "hard");

    expect(action.kind).toBe("play");
    if (action.kind === "play") {
      expect(action.cards).toHaveLength(2);
    }
  });
});
