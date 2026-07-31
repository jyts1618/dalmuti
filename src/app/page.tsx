"use client";

import { useState } from "react";

import { Modal } from "@/components/common/Modal";
import { GameBoard } from "@/components/game/GameBoard";
import { HumanHand } from "@/components/game/HumanHand";
import { ReviewBoard } from "@/components/reviews/ReviewBoard";
import { GameSummary } from "@/components/result/GameSummary";
import { RoundResult } from "@/components/result/RoundResult";
import { PlayerCountSelector } from "@/components/setup/PlayerCountSelector";
import { PlayerNameInput } from "@/components/setup/PlayerNameInput";
import { CARD_NAMES } from "@/game/deck";
import { clearSavedGame } from "@/game/storage";
import { getRequiredReturnCount } from "@/game/taxation";
import { ROLE_LABELS } from "@/game/roleAssignment";
import { useAiTurn } from "@/hooks/useAiTurn";
import { useGame } from "@/hooks/useGame";
import { useSavedGameSnapshot } from "@/hooks/useLocalStorage";
import type { AiDifficulty } from "@/types/game";

const AI_DIFFICULTY_LABELS: Record<AiDifficulty, string> = {
  easy: "쉬움",
  normal: "보통",
  hard: "어려움",
};

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="게임 방법" onClose={onClose}>
      <ul className="space-y-2">
        <li>숫자가 낮은 카드가 더 강합니다.</li>
        <li>같은 숫자의 카드를 한 장 이상 낼 수 있습니다.</li>
        <li>다음 플레이어는 같은 장수이면서 더 강한 카드를 내야 합니다.</li>
        <li>낼 수 없거나 내고 싶지 않으면 패스할 수 있습니다.</li>
        <li>패스해도 같은 트릭에서 다시 차례가 오면 카드를 낼 수 있습니다.</li>
        <li>모든 상대가 연속으로 패스하면 마지막으로 카드를 낸 플레이어가 새 트릭을 시작합니다.</li>
        <li>카드를 먼저 모두 내려놓을수록 다음 라운드에서 높은 계급을 얻습니다.</li>
      </ul>
    </Modal>
  );
}

function StartScreen({
  onCreate,
  onContinue,
  hasSavedGame,
  onShowRules,
  onShowReviews,
}: {
  onCreate: (playerCount: number, humanName: string, aiDifficulty: AiDifficulty) => void;
  onContinue: () => void;
  hasSavedGame: boolean;
  onShowRules: () => void;
  onShowReviews: () => void;
}) {
  const [playerCount, setPlayerCount] = useState(5);
  const [humanName, setHumanName] = useState("나");
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>("normal");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#5b3a6d,#18242e_46%,#160f1d_78%)] px-4 py-8 text-[#fff8e5]">
      <div className="floating-start-card" aria-hidden="true">
        <div className="floating-start-card-inner">
          <span
            className="floating-start-card-face"
            style={{ backgroundImage: "linear-gradient(rgb(22 15 29 / 0.08), rgb(22 15 29 / 0.08)), url(cards/rank-1.png)" }}
          />
          <span
            className="floating-start-card-face floating-start-card-back"
            style={{ backgroundImage: "linear-gradient(rgb(22 15 29 / 0.18), rgb(22 15 29 / 0.18)), url(cards/card-back.png)" }}
          />
        </div>
      </div>
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1360px] content-center gap-8 md:grid-cols-[1fr_420px] md:items-center">
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">The Great Dalmuti</p>
          <h1 className="mt-3 text-5xl font-bold text-amber-50 md:text-7xl">달무티</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#d9f5ef]">
            AI 플레이어들과 경쟁하여 가장 먼저 모든 카드를 내려놓으세요.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex">
            <button
              type="button"
              aria-label="새 게임 설정으로 시작"
              onClick={() => onCreate(playerCount, humanName, aiDifficulty)}
              className="rounded bg-amber-300 px-5 py-3 font-semibold text-[#1a1023] hover:bg-amber-200"
            >
              새 게임
            </button>
            <button
              type="button"
              aria-label="저장된 게임 이어서 하기"
              disabled={!hasSavedGame}
              onClick={onContinue}
              className="rounded border border-amber-200/40 px-5 py-3 text-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              이어서 하기
            </button>
            <button type="button" aria-label="게임 방법 보기" onClick={onShowRules} className="rounded border border-white/20 px-5 py-3">
              게임 방법
            </button>
            <button type="button" aria-label="후기 게시판 보기" onClick={onShowReviews} className="rounded border border-white/20 px-5 py-3">
              후기 게시판
            </button>
          </div>
        </div>
        <div className="rounded-md border border-amber-200/30 bg-white/5 p-5 shadow-2xl">
          <PlayerNameInput value={humanName} onChange={setHumanName} />
          <div className="mt-5">
            <PlayerCountSelector value={playerCount} onChange={setPlayerCount} />
          </div>
          <fieldset className="mt-5">
            <legend className="text-sm text-[#fff8e5]">AI 난이도</legend>
            <div className="mt-2 grid grid-cols-3 gap-2 rounded-md border border-amber-200/30 bg-white/5 p-1">
              {(Object.keys(AI_DIFFICULTY_LABELS) as AiDifficulty[]).map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  aria-label={`AI 난이도 ${AI_DIFFICULTY_LABELS[difficulty]}`}
                  aria-pressed={aiDifficulty === difficulty}
                  onClick={() => setAiDifficulty(difficulty)}
                  className={`rounded px-3 py-2 text-sm font-semibold ${
                    aiDifficulty === difficulty ? "bg-amber-300 text-[#1a1023]" : "text-[#d9f5ef] hover:bg-white/10"
                  }`}
                >
                  {AI_DIFFICULTY_LABELS[difficulty]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-[#d9f5ef]">
              {aiDifficulty === "easy"
                ? "AI가 조커와 강한 카드를 더 쉽게 사용합니다."
                : aiDifficulty === "hard"
                  ? "AI가 조커와 세트를 더 아끼고 마무리 기회를 우선합니다."
                  : "기존과 같은 균형 잡힌 기본 전략입니다."}
            </p>
          </fieldset>
          <button
            type="button"
            aria-label="게임 시작"
            onClick={() => onCreate(playerCount, humanName, aiDifficulty)}
            className="mt-6 w-full rounded bg-amber-300 px-5 py-3 font-semibold text-[#1a1023] hover:bg-amber-200"
          >
            게임 시작
          </button>
        </div>
      </section>
    </main>
  );
}

function DrawingRolesScreen({ state, dispatch }: ReturnType<typeof useGame>) {
  return (
    <main className="min-h-screen bg-[#1c1423] px-4 py-8 text-[#fff8e5]">
      <section className="mx-auto w-full max-w-[1360px]">
        <p className="text-sm text-amber-100">첫 라운드</p>
        <h1 className="mt-2 text-3xl font-bold text-amber-50">계급 추첨</h1>
        <p className="mt-3 text-[#d9f5ef]">낮은 숫자를 뽑을수록 높은 계급을 얻습니다. 조커는 가장 낮은 계급의 카드로 처리됩니다.</p>
        {state.roleDraws.length > 0 ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {state.roleDraws.map((draw) => {
              const player = state.players.find((item) => item.id === draw.playerId);
              return (
                <article key={draw.playerId} className="rounded-md border border-amber-200/30 bg-white/5 p-4">
                  <p className="font-semibold text-amber-100">{player?.name}</p>
                  <p className="mt-2 text-sm text-[#d9f5ef]">
                    추첨 카드: {draw.card.isJoker ? "광대" : `${draw.card.rank} ${CARD_NAMES[draw.card.rank ?? 1]}`}
                  </p>
                  <p className="mt-1 text-sm text-[#fff8e5]">결정 계급: {ROLE_LABELS[draw.assignedRole]}</p>
                </article>
              );
            })}
          </div>
        ) : null}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            aria-label="계급 추첨"
            onClick={() => dispatch({ type: "DRAW_INITIAL_ROLES" })}
            className="rounded border border-amber-200/40 px-4 py-2 text-amber-100"
          >
            계급 추첨
          </button>
          <button
            type="button"
            aria-label="카드 분배 시작"
            disabled={state.roleDraws.length === 0}
            onClick={() => dispatch({ type: "DEAL_CARDS" })}
            className="rounded bg-amber-300 px-4 py-2 font-semibold text-[#1a1023] disabled:cursor-not-allowed disabled:opacity-40"
          >
            카드 분배 시작
          </button>
        </div>
      </section>
    </main>
  );
}

function TaxationScreen({ state, dispatch }: ReturnType<typeof useGame>) {
  const human = state.players.find((player) => player.type === "human");
  const pendingHumanRevolution = state.pendingRevolutionPlayerId === human?.id;
  const requiredReturnCount = human ? getRequiredReturnCount(state.players, human.id) : 0;
  const readyForTax = requiredReturnCount === state.selectedCardIds.length;

  return (
    <main className="min-h-screen bg-[#1c1423] px-4 py-8 text-[#fff8e5]">
      <section className="mx-auto w-full max-w-[1360px]">
        <p className="text-sm text-amber-100">라운드 {state.roundNumber}</p>
        <h1 className="mt-2 text-3xl font-bold text-amber-50">세금과 혁명</h1>
        <p className="mt-3 text-[#d9f5ef]">
          {state.revolutionType !== "none"
            ? "혁명이 선언되어 이번 라운드는 세금을 생략합니다."
            : "농노는 강한 카드를 바치고, 달무티는 정해진 수만큼 카드를 돌려줍니다."}
        </p>

        {pendingHumanRevolution ? (
          <div className="mt-6 rounded-md border border-amber-200/30 bg-white/5 p-5">
            <p className="text-lg font-semibold text-amber-100">조커 2장을 받았습니다. 혁명을 선언하시겠습니까?</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                aria-label="혁명 선언"
                onClick={() => dispatch({ type: "DECLARE_REVOLUTION", payload: { declare: true, playerId: human.id } })}
                className="rounded bg-amber-300 px-4 py-2 font-semibold text-[#1a1023]"
              >
                혁명 선언
              </button>
              <button
                type="button"
                aria-label="혁명 선언하지 않기"
                onClick={() => dispatch({ type: "DECLARE_REVOLUTION", payload: { declare: false } })}
                className="rounded border border-amber-200/40 px-4 py-2 text-amber-100"
              >
                혁명 선언하지 않기
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {requiredReturnCount > 0 && state.revolutionType === "none" ? (
              <>
                <p className="rounded border border-amber-200/30 bg-white/5 p-4 text-sm text-[#fff8e5]">
                  내 계급은 {human ? ROLE_LABELS[human.role] : "-"}입니다. 세금으로 돌려줄 카드 {requiredReturnCount}장을 선택하세요.
                </p>
                <HumanHand state={state} dispatch={dispatch} selectionMode="tax" />
              </>
            ) : null}
            <button
              type="button"
              aria-label="세금 처리 후 플레이 시작"
              disabled={state.revolutionType === "none" && !readyForTax}
              onClick={() => dispatch({ type: "PROCESS_TAXATION", payload: { returnCardIds: state.selectedCardIds } })}
              className="rounded bg-amber-300 px-4 py-2 font-semibold text-[#1a1023] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {state.revolutionType === "none" ? "세금 처리하고 시작" : "플레이 시작"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default function Home() {
  const { state, dispatch } = useGame();
  const savedGame = useSavedGameSnapshot();
  const [showRules, setShowRules] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviewRefreshSignal, setReviewRefreshSignal] = useState(0);

  useAiTurn(state, dispatch);

  function startNewGame(playerCount = 5, humanName = "나", aiDifficulty: AiDifficulty = "normal") {
    clearSavedGame();
    dispatch({ type: "CREATE_GAME", payload: { playerCount, humanName, aiDifficulty } });
  }

  function resetToStart() {
    clearSavedGame();
    dispatch({ type: "RESET_GAME" });
  }

  let content;
  if (state.phase === "setup") {
    content = (
      <StartScreen
        hasSavedGame={Boolean(savedGame)}
        onCreate={startNewGame}
        onContinue={() => savedGame && dispatch({ type: "RESTORE_GAME", payload: { state: savedGame.gameState } })}
        onShowRules={() => setShowRules(true)}
        onShowReviews={() => setShowReviews(true)}
      />
    );
  } else if (state.phase === "drawingRoles" || state.phase === "dealing") {
    content = <DrawingRolesScreen state={state} dispatch={dispatch} />;
  } else if (state.phase === "taxation") {
    content = <TaxationScreen state={state} dispatch={dispatch} />;
  } else if (state.phase === "playing") {
    content = <GameBoard state={state} dispatch={dispatch} onShowRules={() => setShowRules(true)} onShowReviews={() => setShowReviews(true)} onNewGame={resetToStart} />;
  } else if (state.phase === "roundResult") {
    content = <RoundResult state={state} dispatch={dispatch} onNewGame={resetToStart} />;
  } else {
    content = <GameSummary state={state} dispatch={dispatch} />;
  }

  return (
    <>
      {content}
      {showRules ? <RulesModal onClose={() => setShowRules(false)} /> : null}
      {showReviews ? (
        <Modal
          title="후기 게시판"
          onClose={() => setShowReviews(false)}
          widthClassName="max-w-5xl"
          actions={
            <button
              type="button"
              aria-label="후기 새로고침"
              onClick={() => setReviewRefreshSignal((current) => current + 1)}
              className="rounded border border-amber-200/40 px-3 py-1 text-sm text-amber-100 hover:bg-amber-100 hover:text-[#1a1023]"
            >
              새로고침
            </button>
          }
        >
          <ReviewBoard onClose={() => setShowReviews(false)} refreshSignal={reviewRefreshSignal} />
        </Modal>
      ) : null}
    </>
  );
}
