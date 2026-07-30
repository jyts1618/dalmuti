"use client";

import { useMemo, useSyncExternalStore } from "react";

import { parseSavedGame, STORAGE_KEY } from "@/game/storage";
import type { SavedGame } from "@/types/game";

function subscribeToSavedGame(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSavedGameSnapshot(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

function getServerSavedGameSnapshot(): string {
  return "";
}

export function useSavedGameSnapshot(): SavedGame | null {
  const rawSavedGame = useSyncExternalStore(
    subscribeToSavedGame,
    getSavedGameSnapshot,
    getServerSavedGameSnapshot,
  );

  return useMemo(() => parseSavedGame(rawSavedGame), [rawSavedGame]);
}
