import type { CardDef, CardId } from '../types/game';

export const ARENA_WIDTH = 520;
export const ARENA_HEIGHT = 600;
export const RIVER_Y = 300;
export const RIVER_HALF_HEIGHT = 24;
export const LEFT_BRIDGE_X = 132;
export const RIGHT_BRIDGE_X = 388;
export const BRIDGE_WIDTH = 76;

export const MAX_ELIXIR = 10;
export const STARTING_ELIXIR = 5;
export const ELIXIR_REGEN_PER_SEC = 0.5; // +1 Elixir every 2 seconds
export const LOGIC_BONUS_ELIXIR = 3;
export const LOGIC_LOCK_DURATION = 2.0; // 2 seconds lock on error
export const MATCH_DURATION_SECONDS = 120; // 2 minutes
export const DOUBLE_ELIXIR_THRESHOLD = 30; // Last 30 seconds: Elixir Dobrado (2x)
export const CPU_SPAWN_INTERVAL = 5.0; // Every 5 seconds

export const CARDS: Record<CardId, CardDef> = {
  fast_bit: {
    id: 'fast_bit',
    name: 'Bit Rápido',
    shortName: 'Bit Rápido',
    cost: 2,
    kind: 'troop',
    hp: 140,
    speed: 92,
    damage: 24,
    attackInterval: 0.65,
    range: 18,
    targetPreference: 'all',
    radius: 13,
    roleLabel: 'Veloz',
    accentHex: '#06B6D4',
  },
  loop_knight: {
    id: 'loop_knight',
    name: 'Cavaleiro Loop',
    shortName: 'Cavaleiro',
    cost: 4,
    kind: 'troop',
    hp: 360,
    speed: 50,
    damage: 54,
    attackInterval: 1.0,
    range: 22,
    targetPreference: 'all',
    radius: 16,
    roleLabel: 'Corpo-a-corpo',
    accentHex: '#3B82F6',
  },
  mainframe_golem: {
    id: 'mainframe_golem',
    name: 'Golem Mainframe',
    shortName: 'Golem',
    cost: 6,
    kind: 'troop',
    hp: 920,
    speed: 24,
    damage: 105,
    attackInterval: 1.55,
    range: 26,
    targetPreference: 'towers',
    radius: 22,
    roleLabel: 'Foca Torres',
    accentHex: '#8B5CF6',
  },
  debug_fireball: {
    id: 'debug_fireball',
    name: 'Bola de Fogo Debug',
    shortName: 'Fogo Debug',
    cost: 3,
    kind: 'spell',
    hp: 0,
    speed: 0,
    damage: 220,
    attackInterval: 0,
    range: 0,
    targetPreference: 'towers',
    radius: 16,
    splashRadius: 68,
    splashUnitDamage: 145,
    roleLabel: 'Feitiço Área',
    accentHex: '#F97316',
  },
};

export const HAND_ORDER: CardId[] = [
  'fast_bit',
  'loop_knight',
  'mainframe_golem',
  'debug_fireball',
];
