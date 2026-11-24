import { RotateCcw, Trophy, ShieldAlert } from 'lucide-react';
import type { MatchResult } from '../types/game';
import { CrownIcon } from './CardIcon';

interface GameOverModalProps {
  result: MatchResult;
  onPlayAgain: () => void;
}

export function GameOverModal({ result, onPlayAgain }: GameOverModalProps) {
  const isWin = result.winner === 'blue';
  const isDraw = result.winner === 'draw';

  const heading = isWin ? 'Vitória!' : isDraw ? 'Empate!' : 'Derrota';
  const reasonText =
    result.reason === 'king_destroyed'
      ? isWin
        ? 'Você destruiu a Torre do Rei inimiga!'
        : 'Sua Torre do Rei foi destruída.'
      : result.reason === 'more_towers'
        ? isWin
          ? 'Você destruiu mais torres antes do tempo acabar.'
          : 'A CPU destruiu mais torres até o fim do tempo.'
        : result.reason === 'hp_tiebreaker'
          ? isWin
            ? 'Empate em torres — você venceu pelo maior HP restante!'
            : 'Empate em torres — a CPU venceu pelo maior HP restante.'
          : 'Empate absoluto em torres e vida restante.';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={heading}
      className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/82 p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl">
        <div
          className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center border ${
            isWin
              ? 'bg-emerald-950 border-emerald-500/60 text-emerald-400'
              : isDraw
                ? 'bg-amber-950 border-amber-500/60 text-amber-400'
                : 'bg-rose-950 border-rose-500/60 text-rose-400'
          }`}
        >
          {isWin ? (
            <Trophy className="w-7 h-7" />
          ) : (
            <ShieldAlert className="w-7 h-7" />
          )}
        </div>

        <h2
          className={`mt-3 font-display font-black text-3xl tracking-tight ${
            isWin
              ? 'text-emerald-400'
              : isDraw
                ? 'text-amber-300'
                : 'text-rose-400'
          }`}
        >
          {heading}
        </h2>
        <p className="mt-1 text-sm text-slate-300">{reasonText}</p>

        {/* Crown Scoreboard */}
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-950 border border-slate-800 p-3.5">
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-sky-400">
              Jogador (Azul)
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <CrownIcon color="#38BDF8" className="w-5 h-5" />
              <span className="font-mono font-black text-2xl text-white tabular-nums">
                {result.redTowersDestroyed}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              HP Torres: {result.blueRemainingHpPct}%
            </span>
          </div>

          <div className="flex flex-col items-center border-l border-slate-800">
            <span className="text-xs font-semibold text-rose-400">
              CPU (Vermelho)
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <CrownIcon color="#F87171" className="w-5 h-5" />
              <span className="font-mono font-black text-2xl text-white tabular-nums">
                {result.blueTowersDestroyed}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              HP Torres: {result.redRemainingHpPct}%
            </span>
          </div>
        </div>

        {/* Logic & Combat Summary */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2">
            <div className="font-mono font-extrabold text-base text-emerald-400 tabular-nums">
              {result.solvedCount}
            </div>
            <div className="text-[11px] text-slate-400">Acertos</div>
          </div>
          <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2">
            <div className="font-mono font-extrabold text-base text-rose-400 tabular-nums">
              {result.errorCount}
            </div>
            <div className="text-[11px] text-slate-400">Erros Sintaxe</div>
          </div>
          <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2">
            <div className="font-mono font-extrabold text-base text-sky-400 tabular-nums">
              {result.troopsDeployed}
            </div>
            <div className="text-[11px] text-slate-400">Cartas Jogadas</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onPlayAgain}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-display font-black text-base tracking-wide transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Jogar Novamente
        </button>
      </div>
    </div>
  );
}
