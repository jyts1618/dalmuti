import type { Card } from "@/types/game";

type PlayingCardProps = {
  card: Card;
  selected?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  onToggle?: (cardId: string) => void;
};

function getCardImageSrc(card: Card): string {
  if (card.isJoker) return "cards/joker.png";
  return `cards/rank-${card.rank}.png`;
}

export function PlayingCard({ card, selected = false, disabled = false, hidden = false, onToggle }: PlayingCardProps) {
  const label = card.isJoker ? "광대" : `${card.rank} ${card.name}`;
  const imageSrc = hidden ? "cards/card-back.png" : getCardImageSrc(card);
  const visibleRank = card.isJoker ? "J" : card.rank;

  if (hidden) {
    return (
      <div className="card-size relative shrink-0 overflow-hidden rounded-md border border-amber-200/30 bg-[#1a1023] shadow">
        <span
          aria-label="카드 뒷면"
          role="img"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={`${label} 카드 ${selected ? "선택됨" : "선택 안 됨"}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onToggle?.(card.id)}
      className={`card-size relative shrink-0 overflow-hidden rounded-md border bg-[#fff8e5] text-left text-[#1a1023] shadow transition ${
        selected ? "-translate-y-3 border-[#43d6ca] ring-2 ring-[#8ee4da]" : "border-amber-300"
      } ${disabled ? "cursor-not-allowed opacity-70" : "hover:-translate-y-2"}`}
    >
      <span aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageSrc})` }} />
      <span className="absolute left-2 top-2 min-w-6 rounded bg-[#fff8e5]/95 px-1.5 py-0.5 text-center text-sm font-black leading-none text-[#1a1023] shadow ring-1 ring-amber-300/70">
        {visibleRank}
      </span>
      {selected ? (
        <span className="absolute right-2 top-2 rounded-full bg-[#168b8f] px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
          선택
        </span>
      ) : null}
    </button>
  );
}
