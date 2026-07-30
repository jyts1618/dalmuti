import type { GameActionLog } from "@/types/game";

type ActionLogProps = {
  logs: GameActionLog[];
};

export function ActionLog({ logs }: ActionLogProps) {
  return (
    <aside className="rounded-md border border-white/10 bg-white/5 p-4">
      <h2 className="text-sm font-semibold text-amber-100">행동 메시지</h2>
      <ol className="mt-3 max-h-56 space-y-2 overflow-y-auto text-sm text-emerald-50" aria-live="polite">
        {logs.slice(0, 8).map((log) => (
          <li key={log.id}>{log.message}</li>
        ))}
      </ol>
    </aside>
  );
}
