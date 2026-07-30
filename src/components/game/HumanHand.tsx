import type { Dispatch } from "react";

import { PlayingCard } from "@/components/game/PlayingCard";
import { sortHand } from "@/game/deck";
import type { GameAction, GameState } from "@/types/game";

type HumanHandProps = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  selectionMode?: "play" | "tax";
};

export function HumanHand({ state, dispatch, selectionMode = "play" }: HumanHandProps) {
  const human = state.players.find((player) => player.type === "human");
  if (!human) return null;

  const disabled = selectionMode === "play" && state.currentPlayerId !== human.id;

  return (
    <section className="min-w-0 pb-28 md:pb-0">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-amber-100">내 카드</h2>
        <button
          type="button"
          aria-label="카드 정렬"
          onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
          className="rounded border border-white/20 px-3 py-1 text-sm text-emerald-50"
        >
          카드 정렬
        </button>
      </div>
      <div className="grid max-w-full grid-cols-4 gap-2 px-1 pb-4 pt-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10">
        {sortHand(human.hand).map((card) => (
          <PlayingCard
            key={card.id}
            card={card}
            selected={state.selectedCardIds.includes(card.id)}
            disabled={disabled}
            onToggle={(cardId) => dispatch({ type: "SELECT_CARD", payload: { cardId } })}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        선택한 카드 수는 {state.selectedCardIds.length}장입니다.
      </p>
    </section>
  );
}
