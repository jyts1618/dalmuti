import { describe, expect, it, vi } from "vitest";

import { gameReducer, initialGameState } from "@/game/gameReducer";
import { card, player } from "@/tests/testUtils";
import type { GameState } from "@/types/game";

function playingState(): GameState {
  const players = [
    player("a", "grandDalmuti", [card("8", 8)], 0, "human"),
    player("b", "lesserDalmuti", [card("9", 9)], 1),
    player("c", "lesserPeon", [card("10", 10)], 2),
    player("d", "greaterPeon", [card("11", 11)], 3),
  ];

  return {
    ...initialGameState,
    phase: "playing",
    players,
    currentPlayerId: "a",
    leadPlayerId: "a",
  };
}

describe("game reducer", () => {
  it("resets consecutive passes after a card is played", () => {
    const state = { ...playingState(), consecutivePassCount: 2 };
    const next = gameReducer(state, { type: "PLAY_CARDS", payload: { playerId: "a", cardIds: ["8"] } });

    expect(next.consecutivePassCount).toBe(0);
    expect(next.lastPlayedById).toBe("a");
  });

  it("lets the last submitter start the next trick after all others pass", () => {
    let state = gameReducer(playingState(), { type: "PLAY_CARDS", payload: { playerId: "a", cardIds: ["8"] } });
    state = gameReducer(state, { type: "PASS_TURN", payload: { playerId: "b" } });
    state = gameReducer(state, { type: "PASS_TURN", payload: { playerId: "c" } });
    state = gameReducer(state, { type: "PASS_TURN", payload: { playerId: "d" } });

    expect(state.currentTrick).toBeNull();
    expect(state.currentPlayerId).toBe("b");
  });

  it("records finish order and assigns the last player automatically", () => {
    const state = playingState();
    state.players = [
      player("a", "grandDalmuti", [card("8", 8)], 0, "human"),
      player("b", "lesserDalmuti", [], 1),
      player("c", "lesserPeon", [], 2),
      player("d", "greaterPeon", [card("11", 11)], 3),
    ];
    state.finishOrder = ["b", "c"];

    const next = gameReducer(state, { type: "PLAY_CARDS", payload: { playerId: "a", cardIds: ["8"] } });

    expect(next.phase).toBe("roundResult");
    expect(next.finishOrder).toEqual(["b", "c", "a", "d"]);
  });

  it("reassigns next-round roles from finish order", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.1);
    const state = {
      ...initialGameState,
      phase: "roundResult" as const,
      players: [
        player("a", "lesserPeon", [], 2, "human"),
        player("b", "greaterPeon", [card("12", 12)], 3),
        player("c", "grandDalmuti", [], 0),
        player("d", "lesserDalmuti", [], 1),
      ],
      finishOrder: ["a", "c", "d", "b"],
    };
    const next = gameReducer(state, { type: "PREPARE_NEXT_ROUND" });
    randomSpy.mockRestore();

    expect(next.players.find((item) => item.id === "a")?.role).toBe("grandDalmuti");
    expect(next.players.find((item) => item.id === "b")?.role).toBe("greaterPeon");
  });
});
