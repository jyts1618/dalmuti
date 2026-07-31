type PlayerNameInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PlayerNameInput({ value, onChange }: PlayerNameInputProps) {
  return (
    <label className="block text-sm text-[#fff8e5]">
      사용자 이름
      <input
        aria-label="사용자 이름"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="나"
        maxLength={16}
        className="mt-2 w-full rounded border border-amber-200/40 bg-[#1a1023] px-3 py-3 text-base text-amber-50 outline-none focus:border-amber-200"
      />
    </label>
  );
}
