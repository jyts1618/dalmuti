import { PlayingCard } from "@/components/game/PlayingCard";
import { ROLE_LABELS } from "@/game/roleAssignment";
import type { GameState } from "@/types/game";

type TrickAreaProps = {
  state: GameState;
};

export function TrickArea({ state }: TrickAreaProps) {
  const lastPlayer = state.players.find((player) => player.id === state.lastPlayedById);

  return (
    <section className="flex min-h-[342px] min-w-0 flex-col rounded-md border border-amber-200/30 bg-black/20 p-4 text-center md:min-h-[324px]">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-100">현재 트릭</p>
      {state.currentTrick ? (
        <>
          <div className="mt-4 flex h-[122px] max-w-full items-start justify-start gap-2 overflow-x-auto pb-2 md:h-[134px] md:justify-center">
            {state.currentTrick.cards.map((card) => (
              <PlayingCard key={card.id} card={card} disabled />
            ))}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-emerald-50 sm:grid-cols-4">
            <div>
              <dt className="text-emerald-200">제출 숫자</dt>
              <dd className="font-semibold text-amber-100">{state.currentTrick.rank}</dd>
            </div>
            <div>
              <dt className="text-emerald-200">제출 장수</dt>
              <dd className="font-semibold text-amber-100">{state.currentTrick.count}</dd>
            </div>
            <div>
              <dt className="text-emerald-200">마지막 제출</dt>
              <dd className="font-semibold text-amber-100">{lastPlayer?.name ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-emerald-200">연속 패스</dt>
              <dd className="font-semibold text-amber-100">{state.consecutivePassCount}</dd>
            </div>
          </dl>
          {lastPlayer ? <p className="mt-3 text-xs text-emerald-200">{ROLE_LABELS[lastPlayer.role]}의 플레이입니다.</p> : null}
        </>
      ) : (
        <div className="mt-4 flex flex-1 items-center justify-center rounded border border-dashed border-amber-200/30 px-4 py-10 text-emerald-100">
          새 트릭입니다. 현재 플레이어가 원하는 같은 숫자 세트를 낼 수 있습니다.
        </div>
      )}
    </section>
  );
}
