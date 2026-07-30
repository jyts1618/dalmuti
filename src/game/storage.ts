import type { GameState, SavedGame } from "@/types/game";

export const STORAGE_KEY = "dalmuti.savedGame.v1";

export function parseSavedGame(raw: string | null): SavedGame | null {
  try {
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedGame;
    if (parsed.version !== "1.0.0" || parsed.gameState?.version !== "1.0.0") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveGame(state: GameState): void {
  if (typeof window === "undefined" || state.phase === "setup") return;

  const payload: SavedGame = {
    version: "1.0.0",
    savedAt: new Date().toISOString(),
    gameState: state,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadSavedGame(): SavedGame | null {
  if (typeof window === "undefined") return null;
  return parseSavedGame(window.localStorage.getItem(STORAGE_KEY));
}

export function clearSavedGame(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
