export type GamePhase = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type Team = 'blue' | 'red';

export type Lane = 'left' | 'right';

export type CardId =
  | 'fast_bit'
  | 'loop_knight'
  | 'mainframe_golem'
  | 'debug_fireball';

export interface CardDef {
  id: CardId;
  name: string;
  shortName: string;
  cost: number;
  kind: 'troop' | 'spell';
  hp: number;
  speed: number;
  damage: number;
  attackInterval: number;
  range: number;
  targetPreference: 'all' | 'towers';
  radius: number;
  splashRadius?: number;
  splashUnitDamage?: number;
  roleLabel: string;
  accentHex: string;
}

export interface Tower {
  id: string;
  team: Team;
  kind: 'princess' | 'king';
  lane: Lane | 'center';
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  range: number;
  damage: number;
  attackInterval: number;
  attackTimer: number;
  hitFlash: number;
  turretAngle: number;
  destroyed: boolean;
}

export interface Unit {
  id: number;
  cardId: Exclude<CardId, 'debug_fireball'>;
  team: Team;
  lane: Lane;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  attackInterval: number;
  attackTimer: number;
  range: number;
  targetPreference: 'all' | 'towers';
  radius: number;
  state: 'moving' | 'attacking';
  facingAngle: number;
  walkPhase: number;
  attackSwing: number;
  hitFlash: number;
}

export interface Projectile {
  id: number;
  team: Team;
  kind: 'tower_bolt' | 'fireball';
  startX: number;
  startY: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  targetUnitId?: number;
  targetTowerId?: string;
  targetLane?: Lane;
  progress: number;
  duration: number;
  damage: number;
  splashRadius: number;
  splashUnitDamage: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  ring?: boolean;
}

export interface FloatingText {
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  text: string;
  color: string;
  size: number;
}

export interface BooleanChallenge {
  id: number;
  level: 1 | 2 | 3 | 4;
  topic: string;
  statement: string;
  answer: boolean;
  explanation: string;
}

export interface MatchResult {
  winner: 'blue' | 'red' | 'draw';
  reason: 'king_destroyed' | 'more_towers' | 'hp_tiebreaker' | 'exact_draw';
  blueTowersDestroyed: number;
  redTowersDestroyed: number;
  blueRemainingHpPct: number;
  redRemainingHpPct: number;
  solvedCount: number;
  errorCount: number;
  troopsDeployed: number;
  elapsedSeconds: number;
}

export interface HudSnapshot {
  elixir: number;
  timeRemaining: number;
  isDoubleElixir: boolean;
  cpuLevel: 1 | 2 | 3 | 4;
  blueCrowns: number;
  redCrowns: number;
  blueKingHp: number;
  blueKingMaxHp: number;
  redKingHp: number;
  redKingMaxHp: number;
  cpuCooldownProgress: number;
}
