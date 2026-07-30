type ToastProps = {
  message: string;
};

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="rounded border border-amber-200/30 bg-emerald-950/70 px-4 py-3 text-sm text-amber-50" role="status">
      {message}
    </div>
  );
}
