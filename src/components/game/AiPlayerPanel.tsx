import { ROLE_LABELS } from "@/game/roleAssignment";
import type { Player } from "@/types/game";

type AiPlayerPanelProps = {
  player: Player;
  isTurn: boolean;
};

function MiniCardBack() {
  return (
    <span aria-hidden="true" className="relative block h-7 w-5 overflow-hidden rounded-[3px] border border-amber-200/40 bg-emerald-950 shadow-sm">
      <span className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(cards/card-back.png)" }} />
    </span>
  );
}

export function AiPlayerPanel({ player, isTurn }: AiPlayerPanelProps) {
  return (
    <article
      className={`min-w-40 rounded-md border p-3 ${
        isTurn ? "border-amber-200 bg-amber-200/15 shadow-[0_0_18px_rgba(253,230,138,0.25)]" : "border-white/10 bg-white/5"
      }`}
      aria-label={`${player.name} ${ROLE_LABELS[player.role]} 남은 카드 ${player.hand.length}장`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-emerald-50">{player.name}</h3>
        <span className="rounded bg-emerald-950/70 px-2 py-1 text-xs text-amber-100">{ROLE_LABELS[player.role]}</span>
      </div>
      <div className="mt-3" aria-label={`남은 카드 ${player.hand.length}장`}>
        {player.hand.length > 0 ? (
          <div className="grid grid-cols-10 gap-1" aria-hidden="true">
            {Array.from({ length: player.hand.length }, (_, index) => (
              <MiniCardBack key={`${player.id}-back-${index}`} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-green-300">남은 카드 없음</p>
        )}
        <p className="mt-2 text-xs text-emerald-100">남은 카드 {player.hand.length}장</p>
      </div>
      <p className={`mt-1 text-xs ${player.isFinished ? "text-green-300" : player.hasPassedLastTurn ? "text-slate-300" : "text-emerald-200"}`}>
        {player.isFinished ? "라운드 완료" : player.hasPassedLastTurn ? "직전 행동 패스" : isTurn ? "현재 턴" : "대기"}
      </p>
    </article>
  );
}
