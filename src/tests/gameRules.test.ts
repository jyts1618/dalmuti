import { describe, expect, it } from "vitest";

import { canPlayCards, getEffectiveRank, getNextActivePlayer, isTrickComplete, validateCardSelection } from "@/game/gameRules";
import { card, player } from "@/tests/testUtils";

describe("card submission rules", () => {
  it("allows matching ranks to start a trick", () => {
    expect(canPlayCards([card("7a", 7), card("7b", 7)], null).valid).toBe(true);
  });

  it("blocks mixed normal ranks", () => {
    expect(validateCardSelection([card("5", 5), card("4", 4)]).reason).toBe("같은 숫자의 카드만 함께 낼 수 있습니다.");
  });

  it("checks same card count when responding", () => {
    const trick = { cards: [card("9a", 9), card("9b", 9)], rank: 9, count: 2, playedById: "a" };
    expect(canPlayCards([card("8", 8)], trick).reason).toBe("2장의 카드를 선택해야 합니다.");
  });

  it("only allows a lower rank to beat the current trick", () => {
    const trick = { cards: [card("9", 9)], rank: 9, count: 1, playedById: "a" };
    expect(canPlayCards([card("8", 8)], trick).valid).toBe(true);
    expect(canPlayCards([card("10", 10)], trick).reason).toBe("현재 카드보다 더 강한 카드를 내야 합니다.");
  });

  it("treats joker-only play as rank 13", () => {
    expect(getEffectiveRank([card("j", null)])).toBe(13);
    expect(getEffectiveRank([card("j1", null), card("j2", null)])).toBe(13);
  });

  it("lets jokers join one normal rank", () => {
    const trick = { cards: [card("7a", 7), card("7b", 7)], rank: 7, count: 2, playedById: "a" };
    expect(canPlayCards([card("6", 6), card("j", null)], trick).valid).toBe(true);
  });
});

describe("passing and trick completion", () => {
  it("does not exclude a player forever after passing", () => {
    const players = [
      player("a", "grandDalmuti", [card("1", 1)], 0),
      player("b", "lesserDalmuti", [card("2", 2)], 1),
      player("c", "lesserPeon", [card("3", 3)], 2),
      player("d", "greaterPeon", [card("4", 4)], 3),
    ];
    players[1].hasPassedLastTurn = true;

    expect(getNextActivePlayer(players, "a")?.id).toBe("b");
  });

  it("ends a trick after every other active player passes consecutively", () => {
    const players = [
      player("a", "grandDalmuti", [card("1", 1)], 0),
      player("b", "lesserDalmuti", [card("2", 2)], 1),
      player("c", "lesserPeon", [card("3", 3)], 2),
      player("d", "greaterPeon", [card("4", 4)], 3),
    ];
    const trick = { cards: [card("9", 9)], rank: 9, count: 1, playedById: "a" };

    expect(isTrickComplete(players, 2, trick)).toBe(false);
    expect(isTrickComplete(players, 3, trick)).toBe(true);
  });
});
