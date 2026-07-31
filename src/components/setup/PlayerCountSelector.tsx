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
      <label htmlFor="player-count" className="block text-sm text-[#fff8e5]">
        현재 참여 인원
      </label>
      <div className="grid w-full grid-cols-[52px_minmax(0,1fr)_52px] items-center gap-3 sm:grid-cols-[56px_minmax(0,1fr)_56px] sm:gap-4">
        <button
          type="button"
          aria-label="참여 인원 감소"
          onClick={() => setClamped(value - 1)}
          disabled={value <= 4}
          className="h-12 rounded border border-amber-200/40 text-xl font-semibold text-amber-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:h-14"
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
          className="h-12 min-w-0 rounded border border-amber-200/40 bg-[#1a1023] px-3 text-center text-2xl font-semibold text-amber-100 outline-none focus:border-amber-200 sm:h-14"
        />
        <button
          type="button"
          aria-label="참여 인원 증가"
          onClick={() => setClamped(value + 1)}
          disabled={value >= 8}
          className="h-12 rounded border border-amber-200/40 text-xl font-semibold text-amber-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:h-14"
        >
          +
        </button>
      </div>
      <p className="text-sm text-[#fff8e5]">총 {value}명이 참여합니다.</p>
      <p className="text-sm text-[#d9f5ef]">사용자 1명과 AI 플레이어 {value - 1}명으로 게임을 시작합니다.</p>
    </div>
  );
}
