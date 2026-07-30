"use client";

import type { Dispatch } from "react";

import { ActionLog } from "@/components/game/ActionLog";
import { AiPlayerPanel } from "@/components/game/AiPlayerPanel";
import { GameActions } from "@/components/game/GameActions";
import { HumanHand } from "@/components/game/HumanHand";
import { TrickArea } from "@/components/game/TrickArea";
import { ROLE_LABELS } from "@/game/roleAssignment";
import type { GameAction, GameState } from "@/types/game";

const AI_DIFFICULTY_LABELS = {
  easy: "쉬움",
  normal: "보통",
  hard: "어려움",
} as const;

type GameBoardProps = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  onShowRules: () => void;
  onNewGame: () => void;
};

export function GameBoard({ state, dispatch, onShowRules, onNewGame }: GameBoardProps) {
  const human = state.players.find((player) => player.type === "human");
  const currentPlayer = state.players.find((player) => player.id === state.currentPlayerId);
  const aiPlayers = state.players.filter((player) => player.type === "ai");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#164238,#061714_72%)] px-4 py-5 text-emerald-50">
      <div className="mx-auto w-full max-w-[1360px]">
        <header className="flex flex-col gap-3 border-b border-amber-200/20 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-100">달무티</h1>
            <p className="mt-1 text-sm text-emerald-100">
              라운드 {state.roundNumber} · 내 계급 {human ? ROLE_LABELS[human.role] : "-"} · AI {AI_DIFFICULTY_LABELS[state.aiDifficulty]} · 현재 턴 {currentPlayer?.name ?? "-"}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" aria-label="새 게임 시작" onClick={onNewGame} className="rounded border border-amber-200/40 px-3 py-2 text-sm">
              새 게임
            </button>
            <button type="button" aria-label="게임 규칙 보기" onClick={onShowRules} className="rounded bg-amber-300 px-3 py-2 text-sm font-semibold text-emerald-950">
              게임 규칙
            </button>
          </div>
        </header>

        <section className="mt-4 flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4">
          {aiPlayers.map((player) => (
            <AiPlayerPanel key={player.id} player={player} isTurn={player.id === state.currentPlayerId} />
          ))}
        </section>

        <div className="mt-5 grid w-full min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-4">
            <TrickArea state={state} />
            <HumanHand state={state} dispatch={dispatch} />
            <GameActions state={state} dispatch={dispatch} />
          </div>
          <ActionLog logs={state.actionLog} />
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        현재 턴은 {currentPlayer?.name ?? "없음"}입니다.
      </p>
    </main>
  );
}
