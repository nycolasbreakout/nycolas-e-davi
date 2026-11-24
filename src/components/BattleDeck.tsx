import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CARDS, HAND_ORDER, MAX_ELIXIR } from '../data/cards';
import type { CardId, Lane } from '../types/game';
import { CardIcon, ElixirDropIcon } from './CardIcon';

interface BattleDeckProps {
  elixir: number;
  isDoubleElixir: boolean;
  selectedLane: Lane;
  disabled: boolean;
  onSelectLane: (lane: Lane) => void;
  onDeployCard: (cardId: CardId) => void;
}

export function BattleDeck({
  elixir,
  isDoubleElixir,
  selectedLane,
  disabled,
  onSelectLane,
  onDeployCard,
}: BattleDeckProps) {
  const wholeElixir = Math.floor(elixir);
  const elixirPct = Math.min(100, (elixir / MAX_ELIXIR) * 100);

  return (
    <section
      aria-label="Comandos de Batalha"
      className={`rounded-xl border bg-slate-900/95 p-2 sm:p-2.5 flex flex-col gap-2 transition-colors ${
        isDoubleElixir ? 'border-amber-400/75' : 'border-slate-700/90'
      }`}
    >
      {/* Top row: Elixir Bar + Lane Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Elixir Meter */}
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <div
            className={`flex items-center gap-1 shrink-0 rounded-md px-2 py-1 border ${
              isDoubleElixir
                ? 'bg-amber-950/80 border-amber-500/80'
                : 'bg-fuchsia-950/80 border-fuchsia-700/70'
            }`}
          >
            <ElixirDropIcon className="w-4 h-4" />
            <span className="font-mono font-extrabold text-sm text-fuchsia-200 tabular-nums">
              {wholeElixir}
              <span className="text-fuchsia-400/70 text-xs">/{MAX_ELIXIR}</span>
            </span>
            {isDoubleElixir && (
              <span className="ml-0.5 font-mono font-black text-xs text-amber-300">
                2x
              </span>
            )}
          </div>

          <div
            className="relative flex-1 h-4 rounded-md bg-slate-950 border border-slate-800 overflow-hidden"
            aria-label={`Elixir ${wholeElixir} de ${MAX_ELIXIR}${isDoubleElixir ? ' (Elixir Dobrado 2x)' : ''}`}
          >
            <div
              className={`h-full transition-[width] duration-75 ${
                isDoubleElixir
                  ? 'bg-gradient-to-r from-fuchsia-500 via-amber-400 to-yellow-300'
                  : 'bg-gradient-to-r from-fuchsia-600 via-fuchsia-500 to-pink-400'
              }`}
              style={{ width: `${elixirPct}%` }}
            />
            {/* 10 segment tick lines */}
            <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className="border-r border-slate-950/60 last:border-r-0"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Route Selector */}
        <div
          role="group"
          aria-label="Seletor de Rota"
          className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0"
        >
          <button
            type="button"
            onClick={() => onSelectLane('left')}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-display font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedLane === 'left'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Rota Esquerda
          </button>
          <button
            type="button"
            onClick={() => onSelectLane('right')}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-display font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedLane === 'right'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Rota Direita
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Troop / Spell Cards */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {HAND_ORDER.map((cardId) => {
          const card = CARDS[cardId];
          const canAfford = !disabled && elixir >= card.cost;

          return (
            <button
              key={card.id}
              type="button"
              disabled={!canAfford}
              onClick={() => onDeployCard(card.id)}
              title={`${card.name} — Custo ${card.cost} Elixir (${card.roleLabel})`}
              className={`group relative flex flex-col items-center justify-between rounded-lg border p-1.5 sm:p-2 text-center transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-400 ${
                canAfford
                  ? 'border-slate-600 bg-slate-800/95 hover:border-sky-400 hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer'
                  : 'border-slate-800 bg-slate-950/70 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Cost Badge */}
              <div
                className={`absolute top-1 right-1 flex items-center gap-0.5 rounded px-1 py-0.5 font-mono text-[11px] font-extrabold tabular-nums ${
                  canAfford
                    ? 'bg-fuchsia-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {card.cost}
              </div>

              <CardIcon
                cardId={card.id}
                className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 mt-0.5"
              />

              <div className="w-full mt-1">
                <div className="font-display font-bold text-[11px] sm:text-xs text-slate-100 truncate leading-tight">
                  {card.shortName}
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-tight">
                  {card.roleLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
