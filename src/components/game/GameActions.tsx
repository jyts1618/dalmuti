import type { Dispatch } from "react";

import { canPlayCards, getSelectedCards } from "@/game/gameRules";
import type { GameAction, GameState } from "@/types/game";

type GameActionsProps = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
};

export function GameActions({ state, dispatch }: GameActionsProps) {
  const human = state.players.find((player) => player.type === "human");
  const selectedCards = human ? getSelectedCards(human.hand, state.selectedCardIds) : [];
  const isHumanTurn = human?.id === state.currentPlayerId && state.phase === "playing";
  const validation = isHumanTurn
    ? canPlayCards(selectedCards, state.currentTrick)
    : { valid: false, reason: state.phase === "playing" ? "현재 사용자의 턴이 아닙니다." : "플레이 단계가 아닙니다." };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-200/20 bg-[#1c1423]/95 px-4 py-3 backdrop-blur md:static md:rounded-md md:border">
      <div className="mx-auto flex w-full max-w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-sm text-[#fff8e5]">
          선택 카드 {selectedCards.length}장: <span className={validation.valid ? "text-[#8ee4da]" : "text-amber-200"}>{validation.reason}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-label="선택 카드 제출"
            disabled={!validation.valid || !human}
            onClick={() => human && dispatch({ type: "PLAY_CARDS", payload: { playerId: human.id, cardIds: state.selectedCardIds } })}
            className="rounded bg-amber-300 px-4 py-2 text-sm font-semibold text-[#1a1023] disabled:cursor-not-allowed disabled:opacity-40"
          >
            카드 제출
          </button>
          <button
            type="button"
            aria-label="이번 차례 패스"
            disabled={!isHumanTurn || !human}
            onClick={() => human && dispatch({ type: "PASS_TURN", payload: { playerId: human.id } })}
            className="rounded border border-amber-200/40 px-4 py-2 text-sm text-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            패스
          </button>
          <button
            type="button"
            aria-label="카드 선택 취소"
            onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
            className="rounded border border-white/20 px-4 py-2 text-sm text-[#fff8e5]"
          >
            선택 취소
          </button>
        </div>
      </div>
    </div>
  );
}
