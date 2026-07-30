type PlayerCountSelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

export function PlayerCountSelector({ value, onChange }: PlayerCountSelectorProps) {
  function setClamped(nextValue: number) {
    onChange(Math.min(8, Math.max(4, Number.isFinite(nextValue) ? nextValue : 5)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-md border border-amber-200/30 bg-white/5 p-4">
        <button
          type="button"
          aria-label="참여 인원 감소"
          onClick={() => setClamped(value - 1)}
          disabled={value <= 4}
          className="h-10 w-10 rounded border border-amber-200/40 text-xl text-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          -
        </button>
        <label className="flex flex-col items-center gap-2 text-sm text-emerald-50">
          현재 참여 인원
          <input
            aria-label="전체 참여 인원"
            type="number"
            min={4}
            max={8}
            value={value}
            onChange={(event) => setClamped(Number(event.target.value))}
            className="w-20 rounded border border-amber-200/40 bg-emerald-950 px-3 py-2 text-center text-2xl font-semibold text-amber-100"
          />
        </label>
        <button
          type="button"
          aria-label="참여 인원 증가"
          onClick={() => setClamped(value + 1)}
          disabled={value >= 8}
          className="h-10 w-10 rounded border border-amber-200/40 text-xl text-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
      <p className="text-sm text-emerald-50">총 {value}명이 참여합니다.</p>
      <p className="text-sm text-emerald-100">사용자 1명과 AI 플레이어 {value - 1}명으로 게임을 시작합니다.</p>
    </div>
  );
}
