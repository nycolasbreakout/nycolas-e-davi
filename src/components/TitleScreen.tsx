import { Swords } from 'lucide-react';
import { CARDS, HAND_ORDER } from '../data/cards';
import { CardIcon, CrownIcon } from './CardIcon';

interface TitleScreenProps {
  onStart: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/78 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/95 p-6 sm:p-7 shadow-2xl text-center">
        {/* Bespoke SVG Title Lockup */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-950 border border-slate-700 mb-3">
            <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
              <path
                d="M10 46 L14 18 L25 30 L32 12 L39 30 L50 18 L54 46 Z"
                fill="#FBBF24"
                stroke="#0F172A"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <rect x="11" y="46" width="42" height="7" rx="2.5" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.5" />
              <text
                x="32"
                y="40"
                textAnchor="middle"
                fill="#0F172A"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="800"
                fontSize="11"
              >
                &amp;&amp;
              </text>
            </svg>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white">
            Lógica <span className="text-sky-400">Royale</span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-300 max-w-md text-balance">
            Estratégia em tempo real movida a Lógica de Programação. Avalie afirmações para gerar Elixir e derrube as torres inimigas.
          </p>
        </div>

        {/* Concise Mechanics Breakdown */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
          <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3">
            <div className="font-mono font-bold text-xs text-amber-400">
              4 Níveis · 40 Questões
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-snug">
              Variáveis, condicionais, laços e arrays. Acerte para ganhar <strong className="text-emerald-400">+3 Elixir</strong>!
            </p>
          </div>
          <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3">
            <div className="font-display font-bold text-xs text-sky-400">
              2 Rotas e Pontes
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-snug">
              Escolha Esquerda ou Direita e invoque tropas ou feitiços nas pontes.
            </p>
          </div>
          <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3">
            <div className="flex items-center gap-1 font-display font-bold text-xs text-rose-400">
              <CrownIcon color="#F87171" className="w-3.5 h-3.5" />
              <span>2 Minutos</span>
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-snug">
              Derrube a Torre do Rei inimiga ou destrua mais torres até o fim.
            </p>
          </div>
        </div>

        {/* Troop Preview Strip */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {HAND_ORDER.map((id) => {
            const c = CARDS[id];
            return (
              <div
                key={id}
                className="flex flex-col items-center rounded-lg bg-slate-950/80 border border-slate-800 p-2"
              >
                <CardIcon cardId={id} className="w-7 h-7" />
                <span className="mt-1 text-[11px] font-display font-bold text-slate-200 truncate w-full">
                  {c.shortName}
                </span>
                <span className="text-[10px] font-mono text-fuchsia-400">
                  {c.cost} Elixir
                </span>
              </div>
            );
          })}
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={onStart}
          className="mt-6 w-full sm:w-auto min-w-[220px] inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-display font-black text-lg tracking-wide transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 cursor-pointer"
        >
          <Swords className="w-5 h-5" />
          Batalhar
        </button>

        <p className="mt-3 text-xs text-slate-400">
          Clique ou pressione Enter para iniciar · Use A/D para rotas e T/F para responder
        </p>
      </div>
    </div>
  );
}
