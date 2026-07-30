"use client";

import { useEffect, useRef, type Dispatch } from "react";

import { decideAiAction } from "@/game/aiStrategy";
import type { GameAction, GameState } from "@/types/game";

export function useAiTurn(state: GameState, dispatch: Dispatch<GameAction>) {
  const processedTurnRef = useRef<string>("");

  useEffect(() => {
    if (state.phase !== "playing") return;

    const player = state.players.find((item) => item.id === state.currentPlayerId);
    if (!player || player.type !== "ai" || player.isFinished) return;

    const turnKey = `${state.roundNumber}:${player.id}:${state.currentTrick?.playedById ?? "lead"}:${state.currentTrick?.rank ?? "none"}:${state.currentTrick?.count ?? 0}:${state.consecutivePassCount}:${state.actionLog[0]?.id ?? "start"}`;
    if (processedTurnRef.current === turnKey) return;
    processedTurnRef.current = turnKey;

    const delay = 600 + Math.floor(Math.random() * 401);
    const timer = window.setTimeout(() => {
      const action = decideAiAction(player, state.currentTrick);
      if (action.kind === "play") {
        dispatch({ type: "PLAY_CARDS", payload: { playerId: player.id, cardIds: action.cards.map((card) => card.id) } });
      } else {
        dispatch({ type: "PASS_TURN", payload: { playerId: player.id } });
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [dispatch, state]);
}
