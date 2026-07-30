import { describe, expect, it } from "vitest";

import { reverseRolesForGreaterRevolution } from "@/game/roleAssignment";
import { getStrongestTaxCards, processTaxation } from "@/game/taxation";
import { card, player } from "@/tests/testUtils";

describe("taxation and revolution", () => {
  it("selects the greater peon's two strongest non-joker cards", () => {
    const cards = [card("j", null), card("8", 8), card("2", 2), card("1", 1)];

    expect(getStrongestTaxCards(cards, 2).map((item) => item.rank)).toEqual([1, 2]);
  });

  it("moves taxes from peons and returns cards from dalmutis", () => {
    const players = [
      player("grand", "grandDalmuti", [card("12a", 12), card("11a", 11)], 0),
      player("lesser", "lesserDalmuti", [card("10a", 10)], 1),
      player("merchant", "merchant", [card("9a", 9)], 2),
      player("small", "lesserPeon", [card("3a", 3), card("12b", 12)], 3),
      player("big", "greaterPeon", [card("1a", 1), card("2a", 2), card("12c", 12)], 4),
    ];
    const taxed = processTaxation(players);
    const grand = taxed.find((item) => item.id === "grand");
    const big = taxed.find((item) => item.id === "big");

    expect(grand?.hand.some((item) => item.id === "1a")).toBe(true);
    expect(grand?.hand.some((item) => item.id === "2a")).toBe(true);
    expect(big?.hand).toHaveLength(3);
  });

  it("reverses roles for a greater revolution", () => {
    const players = [
      player("grand", "grandDalmuti", [], 0),
      player("lesser", "lesserDalmuti", [], 1),
      player("merchant", "merchant", [], 2),
      player("small", "lesserPeon", [], 3),
      player("big", "greaterPeon", [], 4),
    ];

    const reversed = reverseRolesForGreaterRevolution(players);
    expect(reversed.find((item) => item.id === "big")?.role).toBe("grandDalmuti");
    expect(reversed.find((item) => item.id === "grand")?.role).toBe("greaterPeon");
  });
});
