type PlayerCountSelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

export function PlayerCountSelector({ value, onChange }: PlayerCountSelectorProps) {
  function setClamped(nextValue: number) {
    onChange(Math.min(8, Math.max(4, Number.isFinite(nextValue) ? nextValue : 5)));
  }

  return (
    <div className="space-y-3">
      <label htmlFor="player-count" className="block text-2xl font-semibold text-emerald-50">
        현재 참여 인원
      </label>
      <div className="flex min-h-32 items-center justify-center rounded-[28px] border-2 border-emerald-50/90 bg-white/5 px-4 py-7">
        <div className="grid w-full max-w-xs grid-cols-[56px_minmax(0,1fr)_56px] items-center gap-3 sm:max-w-sm sm:grid-cols-[64px_minmax(0,1fr)_64px] sm:gap-5">
          <button
            type="button"
            aria-label="참여 인원 감소"
            onClick={() => setClamped(value - 1)}
            disabled={value <= 4}
            className="h-14 rounded-xl border-2 border-emerald-50/90 text-2xl font-semibold text-emerald-50 disabled:cursor-not-allowed disabled:opacity-35 sm:h-16"
          >
            -
          </button>
          <input
            id="player-count"
            aria-label="전체 참여 인원"
            type="number"
            min={4}
            max={8}
            value={value}
            onChange={(event) => setClamped(Number(event.target.value))}
            className="h-14 min-w-0 rounded-xl border-2 border-emerald-50/90 bg-transparent px-3 text-center text-3xl font-semibold text-emerald-50 outline-none sm:h-16"
          />
          <button
            type="button"
            aria-label="참여 인원 증가"
            onClick={() => setClamped(value + 1)}
            disabled={value >= 8}
            className="h-14 rounded-xl border-2 border-emerald-50/90 text-2xl font-semibold text-emerald-50 disabled:cursor-not-allowed disabled:opacity-35 sm:h-16"
          >
            +
          </button>
        </div>
      </div>
      <p className="text-sm text-emerald-50">총 {value}명이 참여합니다.</p>
      <p className="text-sm text-emerald-100">사용자 1명과 AI 플레이어 {value - 1}명으로 게임을 시작합니다.</p>
    </div>
  );
}
