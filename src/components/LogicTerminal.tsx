import { AlertTriangle, Check, Terminal } from 'lucide-react';
import { LOGIC_LOCK_DURATION } from '../data/cards';
import type { BooleanChallenge } from '../types/game';

interface LogicTerminalProps {
  challenge: BooleanChallenge;
  lockRemaining: number;
  lockedExplanation: string;
  lastFeedback: 'none' | 'success' | 'error';
  disabled: boolean;
  onAnswer: (choice: boolean) => void;
}

export function LogicTerminal({
  challenge,
  lockRemaining,
  lockedExplanation,
  lastFeedback,
  disabled,
  onAnswer,
}: LogicTerminalProps) {
  const isLocked = lockRemaining > 0;
  const lockPct = Math.min(100, (lockRemaining / LOGIC_LOCK_DURATION) * 100);

  return (
    <section
      aria-label="Terminal Lógico"
      className={`relative rounded-xl border bg-slate-900/95 p-2.5 sm:p-3 transition-colors ${
        isLocked
          ? 'border-rose-500/80 animate-syntax-shake'
          : lastFeedback === 'success'
            ? 'border-emerald-400/80'
            : 'border-slate-700/90'
      }`}
    >
      {/* Top row: Header + Level/Topic + Reward */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-display tracking-tight text-slate-100">
            Terminal Lógico
          </span>
          <span className="text-slate-500" aria-hidden="true">·</span>
          <span className="text-sky-400 font-mono tabular-nums">
            Nível {challenge.level}/4
          </span>
          <span className="text-slate-500" aria-hidden="true">·</span>
          <span className="text-slate-400">{challenge.topic}</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
          <span className="text-slate-400">#{challenge.id}</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="text-emerald-400 font-bold">+3 Elixir</span>
        </div>
      </div>

      {/* Statement + TRUE / FALSE action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-2.5">
        <div className="relative flex items-center rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 min-h-[54px]">
          <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug pr-6">
            {challenge.statement}
          </p>

          {lastFeedback === 'success' && !isLocked && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 text-xs font-mono font-extrabold text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              +3
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:w-52">
          <button
            type="button"
            disabled={disabled || isLocked}
            onClick={() => onAnswer(true)}
            className="min-h-[48px] px-4 py-2 rounded-lg font-display font-extrabold text-sm sm:text-base tracking-wide text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 cursor-pointer whitespace-nowrap"
          >
            TRUE
          </button>
          <button
            type="button"
            disabled={disabled || isLocked}
            onClick={() => onAnswer(false)}
            className="min-h-[48px] px-4 py-2 rounded-lg font-display font-extrabold text-sm sm:text-base tracking-wide text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 cursor-pointer whitespace-nowrap"
          >
            FALSE
          </button>
        </div>
      </div>

      {/* 2-second Syntax Error lock overlay with 1-line step-by-step explanation */}
      {isLocked && (
        <div
          role="alert"
          className="absolute inset-0 z-10 rounded-xl bg-rose-950/95 border border-rose-500 flex flex-col items-center justify-center px-4 py-2 text-center"
        >
          <div className="flex items-center gap-2 text-rose-200 font-display font-extrabold text-sm sm:text-base">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Erro de Sintaxe!</span>
            <span className="text-rose-400/90 font-mono text-xs tabular-nums">
              ({lockRemaining.toFixed(1)}s)
            </span>
          </div>
          <p
            title={lockedExplanation}
            className="w-full max-w-full truncate text-xs sm:text-[13px] text-amber-200 mt-1 font-mono font-semibold"
          >
            {lockedExplanation}
          </p>
          <div className="w-52 h-1.5 bg-rose-900 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-rose-400 transition-none"
              style={{ width: `${lockPct}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
