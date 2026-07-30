"use client";

import { useEffect, useReducer } from "react";

import { gameReducer, initialGameState } from "@/game/gameReducer";
import { saveGame } from "@/game/storage";

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  useEffect(() => {
    saveGame(state);
  }, [state]);

  return { state, dispatch };
}
