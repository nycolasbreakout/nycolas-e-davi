import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BattleDeck } from './components/BattleDeck';
import { CrownIcon } from './components/CardIcon';
import { GameOverModal } from './components/GameOverModal';
import { LogicTerminal } from './components/LogicTerminal';
import { TitleScreen } from './components/TitleScreen';
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  HAND_ORDER,
  LOGIC_LOCK_DURATION,
  MATCH_DURATION_SECONDS,
  STARTING_ELIXIR,
} from './data/cards';
import { renderArena } from './engine/renderer';
import {
  type ArenaSimState,
  createSimulation,
  deployPlayerCard,
  getHudSnapshot,
  grantLogicElixir,
  registerLogicError,
  stepSimulation,
} from './engine/simulation';
import { pickNextLogicQuestion } from './data/logicQuestions';
import type {
  BooleanChallenge,
  CardId,
  GamePhase,
  HudSnapshot,
  Lane,
  MatchResult,
} from './types/game';
import { soundEngine } from './utils/sound';

function formatTimer(seconds: number): string {
  const ceil = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(ceil / 60);
  const secs = ceil % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('TITLE');
  const [selectedLane, setSelectedLane] = useState<Lane>('left');
  const seenIdsRef = useRef<Set<number>>(new Set());
  const [challenge, setChallenge] = useState<BooleanChallenge>(() =>
    pickNextLogicQuestion(0, seenIdsRef.current)
  );
  const [lockRemaining, setLockRemaining] = useState(0);
  const [lockedExplanation, setLockedExplanation] = useState('');
  const [lastFeedback, setLastFeedback] = useState<'none' | 'success' | 'error'>(
    'none'
  );
  const [muted, setMuted] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [hud, setHud] = useState<HudSnapshot>({
    elixir: STARTING_ELIXIR,
    timeRemaining: MATCH_DURATION_SECONDS,
    isDoubleElixir: false,
    cpuLevel: 1,
    blueCrowns: 0,
    redCrowns: 0,
    blueKingHp: 1650,
    blueKingMaxHp: 1650,
    redKingHp: 1650,
    redKingMaxHp: 1650,
    cpuCooldownProgress: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simRef = useRef<ArenaSimState>(createSimulation());
  const phaseRef = useRef<GamePhase>(phase);
  const selectedLaneRef = useRef<Lane>(selectedLane);
  const lockTimerRef = useRef<number>(0);

  phaseRef.current = phase;
  selectedLaneRef.current = selectedLane;

  const startNewMatch = useCallback(() => {
    const fresh = createSimulation();
    simRef.current = fresh;
    seenIdsRef.current.clear();
    lockTimerRef.current = 0;
    setLockRemaining(0);
    setLockedExplanation('');
    setLastFeedback('none');
    const first = pickNextLogicQuestion(0, seenIdsRef.current);
    seenIdsRef.current.add(first.id);
    setChallenge(first);
    setMatchResult(null);
    setHud(getHudSnapshot(fresh));
    setPhase('PLAYING');
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.muted = next;
      return next;
    });
  }, []);

  const handleDeployCard = useCallback((cardId: CardId) => {
    if (phaseRef.current !== 'PLAYING') return;
    const deployed = deployPlayerCard(
      simRef.current,
      cardId,
      selectedLaneRef.current
    );
    if (deployed) {
      setHud(getHudSnapshot(simRef.current));
    }
  }, []);

  const handleLogicAnswer = useCallback(
    (choice: boolean) => {
      if (phaseRef.current !== 'PLAYING' || lockTimerRef.current > 0) return;

      seenIdsRef.current.add(challenge.id);

      if (choice === challenge.answer) {
        grantLogicElixir(simRef.current);
        soundEngine.playLogicSuccess();
        setLastFeedback('success');
        const nextQ = pickNextLogicQuestion(
          simRef.current.solvedCount,
          seenIdsRef.current,
          challenge.id
        );
        seenIdsRef.current.add(nextQ.id);
        setChallenge(nextQ);
        setHud(getHudSnapshot(simRef.current));
      } else {
        registerLogicError(simRef.current);
        soundEngine.playLogicError();
        setLastFeedback('error');
        setLockedExplanation(challenge.explanation);
        lockTimerRef.current = LOGIC_LOCK_DURATION;
        setLockRemaining(LOGIC_LOCK_DURATION);
        const nextQ = pickNextLogicQuestion(
          simRef.current.solvedCount,
          seenIdsRef.current,
          challenge.id
        );
        seenIdsRef.current.add(nextQ.id);
        setChallenge(nextQ);
      }
    },
    [challenge]
  );

  // Brief feedback highlight clear
  useEffect(() => {
    if (lastFeedback === 'none') return;
    const id = window.setTimeout(() => setLastFeedback('none'), 550);
    return () => window.clearTimeout(id);
  }, [lastFeedback]);

  // Main 60fps requestAnimationFrame loop isolated from React state
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let hudSyncAccumulator = 0;

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.05);

      const sim = simRef.current;

      if (phaseRef.current === 'TITLE') {
        // Gentle live river flow animation on Title backdrop
        sim.time += dt;
      } else if (phaseRef.current === 'PLAYING') {
        stepSimulation(sim, dt);

        if (lockTimerRef.current > 0) {
          lockTimerRef.current = Math.max(0, lockTimerRef.current - dt);
        }

        hudSyncAccumulator += dt;
        if (hudSyncAccumulator >= 0.065 || sim.matchEnded) {
          hudSyncAccumulator = 0;
          setHud(getHudSnapshot(sim));
          setLockRemaining(lockTimerRef.current);
        }

        if (sim.matchEnded && sim.result) {
          setMatchResult(sim.result);
          setPhase('GAME_OVER');
        }
      }

      // Render Arena Canvas at crisp DPR
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const targetW = ARENA_WIDTH * dpr;
        const targetH = ARENA_HEIGHT * dpr;
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);
          renderArena(
            ctx,
            sim,
            selectedLaneRef.current,
            phaseRef.current === 'PLAYING'
          );
          ctx.restore();
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  // Keyboard shortcuts for responsive play
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (phaseRef.current === 'TITLE') {
        if (key === 'enter' || key === ' ') {
          e.preventDefault();
          startNewMatch();
        }
        return;
      }

      if (phaseRef.current === 'GAME_OVER') {
        if (key === 'enter') {
          e.preventDefault();
          startNewMatch();
        }
        return;
      }

      if (key === 'escape' || key === 'p') {
        e.preventDefault();
        setPhase((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
        return;
      }

      if (phaseRef.current !== 'PLAYING') return;

      if (key === 'a' || key === 'arrowleft') {
        setSelectedLane('left');
      } else if (key === 'd' || key === 'arrowright') {
        setSelectedLane('right');
      } else if (key === 't') {
        handleLogicAnswer(true);
      } else if (key === 'f') {
        handleLogicAnswer(false);
      } else if (key === '1') {
        handleDeployCard(HAND_ORDER[0]);
      } else if (key === '2') {
        handleDeployCard(HAND_ORDER[1]);
      } else if (key === '3') {
        handleDeployCard(HAND_ORDER[2]);
      } else if (key === '4') {
        handleDeployCard(HAND_ORDER[3]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDeployCard, handleLogicAnswer, startNewMatch]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phase !== 'PLAYING') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    setSelectedLane(relX < 0.5 ? 'left' : 'right');
  };

  const isLowTime = hud.timeRemaining <= 15 && phase === 'PLAYING';

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-between">
      {/* Compact Top HUD Strip */}
      <header className="w-full max-w-[680px] shrink-0 px-2.5 pt-2 pb-1 flex items-center justify-between gap-2">
        {/* Player Blue Crowns */}
        <div className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1">
          <CrownIcon color="#38BDF8" className="w-4 h-4 shrink-0" />
          <span className="text-xs font-display font-bold text-sky-400">
            Azul
          </span>
          <span className="font-mono font-extrabold text-sm text-white tabular-nums">
            {hud.blueCrowns}
          </span>
        </div>

        {/* Center Match Clock + 2x Elixir + Controls */}
        <div className="flex items-center gap-1.5">
          <div
            className={`px-3 py-1 rounded-lg border font-mono font-extrabold text-sm sm:text-base tabular-nums ${
              isLowTime
                ? 'bg-rose-950 border-rose-500 text-rose-300'
                : hud.isDoubleElixir && phase === 'PLAYING'
                  ? 'bg-amber-950/90 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            {formatTimer(hud.timeRemaining)}
          </div>

          {hud.isDoubleElixir && phase === 'PLAYING' && (
            <span className="font-mono font-black text-xs text-amber-300 whitespace-nowrap">
              2x Elixir
            </span>
          )}

          {phase === 'PLAYING' || phase === 'PAUSED' ? (
            <button
              type="button"
              onClick={() =>
                setPhase((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'))
              }
              aria-label={phase === 'PAUSED' ? 'Retomar partida' : 'Pausar partida'}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
            >
              {phase === 'PAUSED' ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={muted ? 'Ativar som' : 'Silenciar som'}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Enemy Red Crowns + Escalating AI Level */}
        <div className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1">
          <span className="font-mono font-extrabold text-sm text-white tabular-nums">
            {hud.redCrowns}
          </span>
          <span className="text-xs font-display font-bold text-rose-400">
            CPU
          </span>
          <span className="text-[11px] font-mono text-slate-400 tabular-nums">
            Nv.{hud.cpuLevel}
          </span>
          <CrownIcon color="#F87171" className="w-4 h-4 shrink-0" />
        </div>
      </header>

      {/* Center Top-Down Arena Canvas */}
      <div className="relative flex-1 min-h-0 w-full max-w-[680px] px-2 py-1 flex items-center justify-center">
        <div className="relative h-full max-h-full aspect-[520/600] max-w-full rounded-xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-emerald-950">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="block w-full h-full cursor-crosshair"
            aria-label="Arena de batalha Lógica Royale com duas rotas e pontes"
          />

          {/* Pause Overlay */}
          {phase === 'PAUSED' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 p-4 text-center">
              <h2 className="font-display font-black text-2xl text-white">
                Jogo Pausado
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPhase('PLAYING')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-display font-extrabold text-sm cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  Continuar
                </button>
                <button
                  type="button"
                  onClick={startNewMatch}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-display font-bold text-sm border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Command Deck + Boolean Logic Terminal */}
      <div className="w-full max-w-[680px] shrink-0 px-2 pb-2 flex flex-col gap-1.5">
        <BattleDeck
          elixir={hud.elixir}
          isDoubleElixir={hud.isDoubleElixir && phase === 'PLAYING'}
          selectedLane={selectedLane}
          disabled={phase !== 'PLAYING'}
          onSelectLane={setSelectedLane}
          onDeployCard={handleDeployCard}
        />

        <LogicTerminal
          challenge={challenge}
          lockRemaining={lockRemaining}
          lockedExplanation={lockedExplanation}
          lastFeedback={lastFeedback}
          disabled={phase !== 'PLAYING'}
          onAnswer={handleLogicAnswer}
        />
      </div>

      {/* Title Screen Modal */}
      {phase === 'TITLE' && <TitleScreen onStart={startNewMatch} />}

      {/* Victory / Defeat Modal */}
      {phase === 'GAME_OVER' && matchResult && (
        <GameOverModal result={matchResult} onPlayAgain={startNewMatch} />
      )}
    </main>
  );
}
