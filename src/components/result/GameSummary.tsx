"use client";

import type { Dispatch } from "react";

import type { GameAction, GameState } from "@/types/game";

type GameSummaryProps = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
};

export function GameSummary({ state, dispatch }: GameSummaryProps) {
  return (
    <main className="min-h-screen bg-[#071d19] px-4 py-10 text-emerald-50">
      <section className="mx-auto w-full max-w-[1360px]">
        <div className="max-w-2xl rounded-md border border-amber-200/30 bg-white/5 p-6">
          <p className="text-sm text-amber-100">게임 요약</p>
          <h1 className="mt-2 text-3xl font-bold">총 {state.roundHistory.length}라운드를 진행했습니다</h1>
          <ol className="mt-6 space-y-3">
            {state.roundHistory.map((entry) => (
              <li key={entry.roundNumber} className="rounded border border-white/10 bg-black/15 p-3">
                라운드 {entry.roundNumber}: 사용자 {entry.userRank}위
              </li>
            ))}
          </ol>
          <button
            type="button"
            aria-label="시작 화면으로 돌아가기"
            onClick={() => dispatch({ type: "RESET_GAME" })}
            className="mt-6 rounded bg-amber-300 px-4 py-2 font-semibold text-emerald-950"
          >
            시작 화면으로
          </button>
        </div>
      </section>
    </main>
  );
}
