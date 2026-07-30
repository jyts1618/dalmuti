"use client";

import type { Dispatch } from "react";

import { ROLE_LABELS, getRolesForPlayerCount } from "@/game/roleAssignment";
import type { GameAction, GameState } from "@/types/game";

type RoundResultProps = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  onNewGame: () => void;
};

export function RoundResult({ state, dispatch, onNewGame }: RoundResultProps) {
  const nextRoles = getRolesForPlayerCount(state.players.length);
  const user = state.players.find((player) => player.type === "human");

  return (
    <main className="min-h-screen bg-[#071d19] px-4 py-8 text-emerald-50">
      <section className="mx-auto w-full max-w-[1360px]">
        <p className="text-sm text-amber-100">라운드 {state.roundNumber} 결과</p>
        <h1 className="mt-2 text-3xl font-bold text-amber-50">순위가 결정되었습니다</h1>
        <div className="mt-6 overflow-hidden rounded-md border border-amber-200/30">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-amber-200 text-emerald-950">
              <tr>
                <th className="p-3">순위</th>
                <th className="p-3">플레이어</th>
                <th className="p-3">이전 계급</th>
                <th className="p-3">다음 계급</th>
                <th className="p-3">남은 카드</th>
              </tr>
            </thead>
            <tbody>
              {state.finishOrder.map((playerId, index) => {
                const player = state.players.find((item) => item.id === playerId);
                if (!player) return null;
                const isUser = player.id === user?.id;
                return (
                  <tr key={playerId} className={isUser ? "bg-teal-400/15" : "bg-white/5"}>
                    <td className="p-3 font-semibold text-amber-100">{index + 1}위</td>
                    <td className="p-3">{player.name} · {player.type === "human" ? "사용자" : "AI"}</td>
                    <td className="p-3">{ROLE_LABELS[player.role]}</td>
                    <td className="p-3">{ROLE_LABELS[nextRoles[index]]}</td>
                    <td className="p-3">{player.hand.length}장</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            aria-label="다음 라운드 진행"
            onClick={() => dispatch({ type: "PREPARE_NEXT_ROUND" })}
            className="rounded bg-amber-300 px-4 py-2 font-semibold text-emerald-950"
          >
            다음 라운드 진행
          </button>
          <button
            type="button"
            aria-label="현재 게임 종료"
            onClick={() => dispatch({ type: "END_GAME" })}
            className="rounded border border-amber-200/40 px-4 py-2 text-amber-100"
          >
            현재 게임 종료
          </button>
          <button type="button" aria-label="새 게임 시작" onClick={onNewGame} className="rounded border border-white/20 px-4 py-2">
            새 게임 시작
          </button>
        </div>
      </section>
    </main>
  );
}
