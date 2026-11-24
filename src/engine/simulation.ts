import {
  ARENA_WIDTH,
  CARDS,
  CPU_SPAWN_INTERVAL,
  DOUBLE_ELIXIR_THRESHOLD,
  ELIXIR_REGEN_PER_SEC,
  LEFT_BRIDGE_X,
  LOGIC_BONUS_ELIXIR,
  MATCH_DURATION_SECONDS,
  MAX_ELIXIR,
  RIGHT_BRIDGE_X,
  RIVER_Y,
  STARTING_ELIXIR,
} from '../data/cards';
import type {
  CardId,
  FloatingText,
  HudSnapshot,
  Lane,
  MatchResult,
  Particle,
  Projectile,
  Team,
  Tower,
  Unit,
} from '../types/game';
import { soundEngine } from '../utils/sound';

export interface ArenaSimState {
  time: number;
  timeRemaining: number;
  elixir: number;
  towers: Tower[];
  units: Unit[];
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  nextUnitId: number;
  nextProjectileId: number;
  cpuSpawnTimer: number;
  screenShake: number;
  hitstopTimer: number;
  solvedCount: number;
  errorCount: number;
  troopsDeployed: number;
  doubleElixirTriggered: boolean;
  matchEnded: boolean;
  result: MatchResult | null;
}

function createInitialTowers(): Tower[] {
  return [
    // Red (CPU - Top)
    {
      id: 'red_princess_left',
      team: 'red',
      kind: 'princess',
      lane: 'left',
      x: LEFT_BRIDGE_X,
      y: 118,
      radius: 25,
      hp: 900,
      maxHp: 900,
      range: 132,
      damage: 24,
      attackInterval: 0.95,
      attackTimer: 0.4,
      hitFlash: 0,
      turretAngle: Math.PI / 2,
      destroyed: false,
    },
    {
      id: 'red_princess_right',
      team: 'red',
      kind: 'princess',
      lane: 'right',
      x: RIGHT_BRIDGE_X,
      y: 118,
      radius: 25,
      hp: 900,
      maxHp: 900,
      range: 132,
      damage: 24,
      attackInterval: 0.95,
      attackTimer: 0.4,
      hitFlash: 0,
      turretAngle: Math.PI / 2,
      destroyed: false,
    },
    {
      id: 'red_king',
      team: 'red',
      kind: 'king',
      lane: 'center',
      x: ARENA_WIDTH / 2,
      y: 54,
      radius: 32,
      hp: 1650,
      maxHp: 1650,
      range: 148,
      damage: 34,
      attackInterval: 1.0,
      attackTimer: 0.5,
      hitFlash: 0,
      turretAngle: Math.PI / 2,
      destroyed: false,
    },

    // Blue (Player - Bottom)
    {
      id: 'blue_princess_left',
      team: 'blue',
      kind: 'princess',
      lane: 'left',
      x: LEFT_BRIDGE_X,
      y: 482,
      radius: 25,
      hp: 900,
      maxHp: 900,
      range: 132,
      damage: 24,
      attackInterval: 0.95,
      attackTimer: 0.4,
      hitFlash: 0,
      turretAngle: -Math.PI / 2,
      destroyed: false,
    },
    {
      id: 'blue_princess_right',
      team: 'blue',
      kind: 'princess',
      lane: 'right',
      x: RIGHT_BRIDGE_X,
      y: 482,
      radius: 25,
      hp: 900,
      maxHp: 900,
      range: 132,
      damage: 24,
      attackInterval: 0.95,
      attackTimer: 0.4,
      hitFlash: 0,
      turretAngle: -Math.PI / 2,
      destroyed: false,
    },
    {
      id: 'blue_king',
      team: 'blue',
      kind: 'king',
      lane: 'center',
      x: ARENA_WIDTH / 2,
      y: 546,
      radius: 32,
      hp: 1650,
      maxHp: 1650,
      range: 148,
      damage: 34,
      attackInterval: 1.0,
      attackTimer: 0.5,
      hitFlash: 0,
      turretAngle: -Math.PI / 2,
      destroyed: false,
    },
  ];
}

export function createSimulation(): ArenaSimState {
  return {
    time: 0,
    timeRemaining: MATCH_DURATION_SECONDS,
    elixir: STARTING_ELIXIR,
    towers: createInitialTowers(),
    units: [],
    projectiles: [],
    particles: [],
    floatingTexts: [],
    nextUnitId: 1,
    nextProjectileId: 1,
    cpuSpawnTimer: 2.2, // First enemy wave arrives quickly to keep opening lively
    screenShake: 0,
    hitstopTimer: 0,
    solvedCount: 0,
    errorCount: 0,
    troopsDeployed: 0,
    doubleElixirTriggered: false,
    matchEnded: false,
    result: null,
  };
}

function laneBridgeX(lane: Lane): number {
  return lane === 'left' ? LEFT_BRIDGE_X : RIGHT_BRIDGE_X;
}

function spawnParticles(
  sim: ArenaSimState,
  x: number,
  y: number,
  color: string,
  count: number,
  speed = 90,
  size = 4,
  life = 0.42
) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const spd = speed * (0.45 + Math.random() * 0.75);
    sim.particles.push({
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life,
      maxLife: life,
      size: size * (0.7 + Math.random() * 0.6),
      color,
    });
  }
}

function spawnRing(
  sim: ArenaSimState,
  x: number,
  y: number,
  color: string,
  maxSize: number,
  life = 0.35
) {
  sim.particles.push({
    x,
    y,
    vx: 0,
    vy: 0,
    life,
    maxLife: life,
    size: maxSize,
    color,
    ring: true,
  });
}

function spawnFloatingText(
  sim: ArenaSimState,
  x: number,
  y: number,
  text: string,
  color: string,
  size = 13
) {
  sim.floatingTexts.push({
    x,
    y,
    vy: -32,
    life: 0.72,
    maxLife: 0.72,
    text,
    color,
    size,
  });
}

export function grantLogicElixir(sim: ArenaSimState): number {
  const before = sim.elixir;
  sim.elixir = Math.min(MAX_ELIXIR, sim.elixir + LOGIC_BONUS_ELIXIR);
  const gained = sim.elixir - before;
  sim.solvedCount += 1;

  const blueKing = sim.towers.find((t) => t.id === 'blue_king');
  if (blueKing) {
    spawnRing(sim, blueKing.x, blueKing.y, '#FBBF24', 56, 0.45);
    spawnFloatingText(
      sim,
      blueKing.x,
      blueKing.y - 34,
      `+${LOGIC_BONUS_ELIXIR} ELIXIR`,
      '#FDE047',
      14
    );
  }
  return gained;
}

export function registerLogicError(sim: ArenaSimState) {
  sim.errorCount += 1;
}

export function getActiveTargetTower(
  sim: ArenaSimState,
  attackerTeam: Team,
  lane: Lane
): Tower | undefined {
  const enemyTeam: Team = attackerTeam === 'blue' ? 'red' : 'blue';
  const princess = sim.towers.find(
    (t) =>
      t.team === enemyTeam &&
      t.kind === 'princess' &&
      t.lane === lane &&
      !t.destroyed
  );
  if (princess) return princess;
  return sim.towers.find(
    (t) => t.team === enemyTeam && t.kind === 'king' && !t.destroyed
  );
}

export function spawnUnit(
  sim: ArenaSimState,
  team: Team,
  cardId: Exclude<CardId, 'debug_fireball'>,
  lane: Lane
) {
  const def = CARDS[cardId];
  const bx = laneBridgeX(lane);
  const jitterX = (Math.random() - 0.5) * 18;
  // Spawn right on the team's edge of the chosen bridge
  const spawnY = team === 'blue' ? RIVER_Y + 42 : RIVER_Y - 42;

  const unit: Unit = {
    id: sim.nextUnitId++,
    cardId,
    team,
    lane,
    x: bx + jitterX,
    y: spawnY,
    hp: def.hp,
    maxHp: def.hp,
    speed: def.speed,
    damage: def.damage,
    attackInterval: def.attackInterval,
    attackTimer: 0.12,
    range: def.range,
    targetPreference: def.targetPreference,
    radius: def.radius,
    state: 'moving',
    facingAngle: team === 'blue' ? -Math.PI / 2 : Math.PI / 2,
    walkPhase: Math.random() * Math.PI * 2,
    attackSwing: 0,
    hitFlash: 0,
  };

  sim.units.push(unit);
  const ringColor = team === 'blue' ? '#60A5FA' : '#F87171';
  spawnRing(sim, unit.x, unit.y, ringColor, def.radius * 2.2, 0.32);
  spawnParticles(sim, unit.x, unit.y, ringColor, 7, 55, 3, 0.3);
}

export function deployPlayerCard(
  sim: ArenaSimState,
  cardId: CardId,
  lane: Lane
): boolean {
  if (sim.matchEnded) return false;
  const def = CARDS[cardId];
  if (sim.elixir < def.cost) return false;

  sim.elixir -= def.cost;
  sim.troopsDeployed += 1;

  if (cardId === 'debug_fireball') {
    const targetTower = getActiveTargetTower(sim, 'blue', lane);
    const blueKing = sim.towers.find((t) => t.id === 'blue_king');
    const startX = blueKing ? blueKing.x : ARENA_WIDTH / 2;
    const startY = blueKing ? blueKing.y : 540;
    const targetX = targetTower ? targetTower.x : laneBridgeX(lane);
    const targetY = targetTower ? targetTower.y : 118;

    sim.projectiles.push({
      id: sim.nextProjectileId++,
      team: 'blue',
      kind: 'fireball',
      startX,
      startY,
      x: startX,
      y: startY,
      targetX,
      targetY,
      targetTowerId: targetTower?.id,
      targetLane: lane,
      progress: 0,
      duration: 0.42,
      damage: def.damage,
      splashRadius: def.splashRadius ?? 68,
      splashUnitDamage: def.splashUnitDamage ?? 140,
    });
    soundEngine.playCardSpawn(def.cost);
    return true;
  }

  spawnUnit(sim, 'blue', cardId, lane);
  soundEngine.playCardSpawn(def.cost);
  return true;
}

function damageTower(
  sim: ArenaSimState,
  tower: Tower,
  amount: number,
  heavy = false
) {
  if (tower.destroyed) return;
  tower.hp = Math.max(0, tower.hp - amount);
  tower.hitFlash = 0.16;

  spawnFloatingText(
    sim,
    tower.x + (Math.random() - 0.5) * 14,
    tower.y - tower.radius - 10,
    `-${Math.round(amount)}`,
    tower.team === 'red' ? '#FDE047' : '#FCA5A5',
    heavy ? 14 : 11
  );

  if (tower.hp <= 0) {
    tower.destroyed = true;
    sim.screenShake = Math.max(sim.screenShake, tower.kind === 'king' ? 12 : 8);
    sim.hitstopTimer = Math.max(sim.hitstopTimer, 0.06);
    spawnParticles(
      sim,
      tower.x,
      tower.y,
      tower.team === 'red' ? '#EF4444' : '#3B82F6',
      24,
      150,
      6,
      0.65
    );
    spawnParticles(sim, tower.x, tower.y, '#FBBF24', 16, 120, 5, 0.55);
    spawnRing(sim, tower.x, tower.y, '#FDE047', 78, 0.5);
    soundEngine.playTowerDestroyed();
  }
}

function damageUnit(
  sim: ArenaSimState,
  unit: Unit,
  amount: number,
  heavy = false
) {
  if (unit.hp <= 0) return;
  unit.hp = Math.max(0, unit.hp - amount);
  unit.hitFlash = 0.14;

  if (heavy) {
    spawnFloatingText(
      sim,
      unit.x,
      unit.y - unit.radius - 8,
      `-${Math.round(amount)}`,
      '#FBBF24',
      12
    );
  }

  if (unit.hp <= 0) {
    const color = unit.team === 'blue' ? '#60A5FA' : '#F87171';
    spawnParticles(sim, unit.x, unit.y, color, 11, 85, 4, 0.4);
  }
}

function resolveFireballImpact(sim: ArenaSimState, proj: Projectile) {
  soundEngine.playFireball();
  sim.screenShake = Math.max(sim.screenShake, 9);
  sim.hitstopTimer = Math.max(sim.hitstopTimer, 0.045);

  spawnRing(sim, proj.targetX, proj.targetY, '#FB923C', proj.splashRadius, 0.45);
  spawnParticles(sim, proj.targetX, proj.targetY, '#F97316', 20, 145, 5.5, 0.52);
  spawnParticles(sim, proj.targetX, proj.targetY, '#FDE047', 12, 95, 4, 0.4);

  const enemyTeam: Team = proj.team === 'blue' ? 'red' : 'blue';

  // Area damage on towers within splash radius (or explicit target tower)
  for (const tower of sim.towers) {
    if (tower.team !== enemyTeam || tower.destroyed) continue;
    const dist = Math.hypot(tower.x - proj.targetX, tower.y - proj.targetY);
    if (dist <= proj.splashRadius + tower.radius || tower.id === proj.targetTowerId) {
      damageTower(sim, tower, proj.damage, true);
    }
  }

  // Area damage on enemy troops within splash radius
  for (const unit of sim.units) {
    if (unit.team !== enemyTeam || unit.hp <= 0) continue;
    const dist = Math.hypot(unit.x - proj.targetX, unit.y - proj.targetY);
    if (dist <= proj.splashRadius + unit.radius) {
      damageUnit(sim, unit, proj.splashUnitDamage, true);
    }
  }
}

function computeResult(
  sim: ArenaSimState,
  forcedReason?: MatchResult['reason']
): MatchResult {
  const redTowersDestroyed = sim.towers.filter(
    (t) => t.team === 'red' && t.destroyed
  ).length;
  const blueTowersDestroyed = sim.towers.filter(
    (t) => t.team === 'blue' && t.destroyed
  ).length;

  const blueKingDestroyed =
    sim.towers.find((t) => t.id === 'blue_king')?.destroyed ?? false;
  const redKingDestroyed =
    sim.towers.find((t) => t.id === 'red_king')?.destroyed ?? false;

  const blueSum = sim.towers
    .filter((t) => t.team === 'blue')
    .reduce((acc, t) => acc + t.hp, 0);
  const blueMax = sim.towers
    .filter((t) => t.team === 'blue')
    .reduce((acc, t) => acc + t.maxHp, 0);
  const redSum = sim.towers
    .filter((t) => t.team === 'red')
    .reduce((acc, t) => acc + t.hp, 0);
  const redMax = sim.towers
    .filter((t) => t.team === 'red')
    .reduce((acc, t) => acc + t.maxHp, 0);

  const blueRemainingHpPct = Math.round((blueSum / blueMax) * 100);
  const redRemainingHpPct = Math.round((redSum / redMax) * 100);

  let winner: MatchResult['winner'] = 'draw';
  let reason: MatchResult['reason'] = forcedReason ?? 'more_towers';

  if (redKingDestroyed && !blueKingDestroyed) {
    winner = 'blue';
    reason = 'king_destroyed';
  } else if (blueKingDestroyed && !redKingDestroyed) {
    winner = 'red';
    reason = 'king_destroyed';
  } else if (redTowersDestroyed > blueTowersDestroyed) {
    winner = 'blue';
    reason = 'more_towers';
  } else if (blueTowersDestroyed > redTowersDestroyed) {
    winner = 'red';
    reason = 'more_towers';
  } else if (blueSum > redSum) {
    winner = 'blue';
    reason = 'hp_tiebreaker';
  } else if (redSum > blueSum) {
    winner = 'red';
    reason = 'hp_tiebreaker';
  } else {
    winner = 'draw';
    reason = 'exact_draw';
  }

  return {
    winner,
    reason,
    blueTowersDestroyed,
    redTowersDestroyed,
    blueRemainingHpPct,
    redRemainingHpPct,
    solvedCount: sim.solvedCount,
    errorCount: sim.errorCount,
    troopsDeployed: sim.troopsDeployed,
    elapsedSeconds: Math.round(sim.time),
  };
}

function getCpuLevel(elapsed: number): 1 | 2 | 3 | 4 {
  if (elapsed >= 90) return 4; // Final 30s (2x Elixir)
  if (elapsed >= 60) return 3; // Minute 2: Combos & Spells
  if (elapsed >= 30) return 2; // Reactive Defense
  return 1;                    // Opening
}

function getCpuSpawnInterval(level: 1 | 2 | 3 | 4): number {
  switch (level) {
    case 1:
      return 5.0;
    case 2:
      return 4.3;
    case 3:
      return 3.6;
    case 4:
      return 2.7;
  }
}

function launchCpuFireball(sim: ArenaSimState, lane: Lane) {
  const def = CARDS.debug_fireball;
  const targetTower = getActiveTargetTower(sim, 'red', lane);
  const redKing = sim.towers.find((t) => t.id === 'red_king');
  const startX = redKing ? redKing.x : ARENA_WIDTH / 2;
  const startY = redKing ? redKing.y : 54;
  const targetX = targetTower ? targetTower.x : laneBridgeX(lane);
  const targetY = targetTower ? targetTower.y : 482;

  sim.projectiles.push({
    id: sim.nextProjectileId++,
    team: 'red',
    kind: 'fireball',
    startX,
    startY,
    x: startX,
    y: startY,
    targetX,
    targetY,
    targetTowerId: targetTower?.id,
    targetLane: lane,
    progress: 0,
    duration: 0.45,
    damage: def.damage,
    splashRadius: def.splashRadius ?? 68,
    splashUnitDamage: def.splashUnitDamage ?? 145,
  });
}

function executeSmartCpuTurn(sim: ArenaSimState) {
  const level = getCpuLevel(sim.time);

  // Level 1 (0–30s): Simple random lane, mostly light troops
  if (level === 1) {
    const lane: Lane = Math.random() < 0.5 ? 'left' : 'right';
    const r = Math.random();
    const troop: Exclude<CardId, 'debug_fireball'> =
      r < 0.6 ? 'fast_bit' : r < 0.95 ? 'loop_knight' : 'mainframe_golem';
    spawnUnit(sim, 'red', troop, lane);
    return;
  }

  // Evaluate threats and opportunities per lane
  const laneThreat = (lane: Lane) => {
    const blues = sim.units.filter((u) => u.team === 'blue' && u.lane === lane && u.hp > 0);
    const reds = sim.units.filter((u) => u.team === 'red' && u.lane === lane && u.hp > 0);
    // Higher threat when blue units are closer to red territory (smaller y)
    const bluePower = blues.reduce((acc, u) => {
      const urgency = u.y < RIVER_Y + 40 ? 1.7 : 1.0;
      const weight =
        u.cardId === 'mainframe_golem' ? 3.2 : u.cardId === 'loop_knight' ? 2.0 : 1.1;
      return acc + weight * urgency;
    }, 0);
    const redPower = reds.reduce((acc, u) => {
      const weight =
        u.cardId === 'mainframe_golem' ? 2.6 : u.cardId === 'loop_knight' ? 1.8 : 1.0;
      return acc + weight;
    }, 0);
    return {
      blues,
      reds,
      netThreat: bluePower - redPower * 0.75,
      hasBlueGolem: blues.some((u) => u.cardId === 'mainframe_golem'),
      hasRedGolem: reds.some((u) => u.cardId === 'mainframe_golem'),
      clusteredNearTower: blues.filter((u) => u.y < 185).length >= 2,
    };
  };

  const left = laneThreat('left');
  const right = laneThreat('right');

  const blueLeftPrincess = sim.towers.find((t) => t.id === 'blue_princess_left');
  const blueRightPrincess = sim.towers.find((t) => t.id === 'blue_princess_right');
  const blueKing = sim.towers.find((t) => t.id === 'blue_king');

  // Level 3 & 4: Tactical Fireball to finish a low-HP blue tower or punish grouped attackers
  if (level >= 3) {
    const finishLeft =
      blueLeftPrincess && !blueLeftPrincess.destroyed && blueLeftPrincess.hp <= 225;
    const finishRight =
      blueRightPrincess && !blueRightPrincess.destroyed && blueRightPrincess.hp <= 225;
    const finishKing =
      blueKing &&
      !blueKing.destroyed &&
      blueKing.hp <= 225 &&
      (blueLeftPrincess?.destroyed || blueRightPrincess?.destroyed);

    if (finishLeft) {
      launchCpuFireball(sim, 'left');
      return;
    }
    if (finishRight) {
      launchCpuFireball(sim, 'right');
      return;
    }
    if (finishKing) {
      const kingLane: Lane = blueLeftPrincess?.destroyed ? 'left' : 'right';
      launchCpuFireball(sim, kingLane);
      return;
    }
    if (left.clusteredNearTower && Math.random() < (level === 4 ? 0.55 : 0.3)) {
      launchCpuFireball(sim, 'left');
      return;
    }
    if (right.clusteredNearTower && Math.random() < (level === 4 ? 0.55 : 0.3)) {
      launchCpuFireball(sim, 'right');
      return;
    }
  }

  // Decide lane: defend highest net threat, otherwise exploit weakest blue lane
  let chosenLane: Lane;
  if (left.netThreat > 1.2 || right.netThreat > 1.2) {
    chosenLane = left.netThreat >= right.netThreat ? 'left' : 'right';
  } else if (level >= 3 && (left.hasRedGolem || right.hasRedGolem)) {
    // Support an existing Golem push!
    chosenLane = left.hasRedGolem ? 'left' : 'right';
  } else {
    const leftScore = blueLeftPrincess?.destroyed ? 0 : (blueLeftPrincess?.hp ?? 900);
    const rightScore = blueRightPrincess?.destroyed ? 0 : (blueRightPrincess?.hp ?? 900);
    if (leftScore !== rightScore) {
      chosenLane = leftScore < rightScore ? 'left' : 'right';
    } else {
      chosenLane = Math.random() < 0.5 ? 'left' : 'right';
    }
  }

  const chosenInfo = chosenLane === 'left' ? left : right;

  // Smart unit selection based on lane state and AI level
  let troop: Exclude<CardId, 'debug_fireball'>;
  if (chosenInfo.hasBlueGolem) {
    // Counter Golem with fast DPS or Knight
    troop = Math.random() < 0.65 ? 'fast_bit' : 'loop_knight';
  } else if (chosenInfo.netThreat > 1.5) {
    // Defend against incoming push with solid melee Knight
    troop = Math.random() < 0.7 ? 'loop_knight' : 'fast_bit';
  } else if (chosenInfo.hasRedGolem) {
    // Escort the Red Golem with fast_bit or loop_knight
    troop = Math.random() < 0.65 ? 'fast_bit' : 'loop_knight';
  } else {
    // Proactive push: higher levels initiate more Golem Mainframe pushes
    const r = Math.random();
    const golemChance = level === 4 ? 0.38 : level === 3 ? 0.3 : 0.2;
    if (r < golemChance) troop = 'mainframe_golem';
    else if (r < golemChance + 0.45) troop = 'loop_knight';
    else troop = 'fast_bit';
  }

  spawnUnit(sim, 'red', troop, chosenLane);
}

export function stepSimulation(sim: ArenaSimState, rawDt: number) {
  if (sim.matchEnded) return;

  const dt = Math.min(rawDt, 0.05);

  if (sim.screenShake > 0) {
    sim.screenShake = Math.max(0, sim.screenShake - dt * 32);
  }

  if (sim.hitstopTimer > 0) {
    sim.hitstopTimer = Math.max(0, sim.hitstopTimer - dt);
    return;
  }

  sim.time += dt;
  sim.timeRemaining = Math.max(0, sim.timeRemaining - dt);
  const isDoubleElixir = sim.timeRemaining <= DOUBLE_ELIXIR_THRESHOLD;
  if (isDoubleElixir && !sim.doubleElixirTriggered) {
    sim.doubleElixirTriggered = true;
    soundEngine.playDoubleElixir();
    spawnFloatingText(
      sim,
      ARENA_WIDTH / 2,
      RIVER_Y - 38,
      'ELIXIR DOBRADO 2x!',
      '#FDE047',
      16
    );
  }

  const regenRate = ELIXIR_REGEN_PER_SEC * (isDoubleElixir ? 2 : 1);
  sim.elixir = Math.min(MAX_ELIXIR, sim.elixir + regenRate * dt);

  // Escalating CPU AI decision & spawn rhythm
  const cpuLevel = getCpuLevel(sim.time);
  sim.cpuSpawnTimer -= dt;
  if (sim.cpuSpawnTimer <= 0) {
    sim.cpuSpawnTimer += getCpuSpawnInterval(cpuLevel);
    executeSmartCpuTurn(sim);
  }

  // Update Units
  for (const unit of sim.units) {
    if (unit.hp <= 0) continue;
    unit.hitFlash = Math.max(0, unit.hitFlash - dt);
    unit.attackSwing = Math.max(0, unit.attackSwing - dt * 4.5);
    unit.attackTimer = Math.max(0, unit.attackTimer - dt);

    const enemyTeam: Team = unit.team === 'blue' ? 'red' : 'blue';

    // Find enemy unit target in same lane if unit engages troops
    let targetUnit: Unit | null = null;
    if (unit.targetPreference === 'all') {
      let bestDist = Infinity;
      for (const other of sim.units) {
        if (other.team !== enemyTeam || other.hp <= 0) continue;
        // Engage enemies on the same lane or very close (e.g. near King tower)
        const dist = Math.hypot(other.x - unit.x, other.y - unit.y);
        const sameLane = other.lane === unit.lane;
        const aggroRadius = sameLane ? 130 : 75;
        if (dist <= aggroRadius && dist < bestDist) {
          bestDist = dist;
          targetUnit = other;
        }
      }
    }

    const targetTower = getActiveTargetTower(sim, unit.team, unit.lane);

    // Determine target position & whether in attack range
    let moveX = unit.x;
    let moveY = unit.y;
    let attackingTarget: { kind: 'unit'; ref: Unit } | { kind: 'tower'; ref: Tower } | null =
      null;

    if (targetUnit) {
      const dist = Math.hypot(targetUnit.x - unit.x, targetUnit.y - unit.y);
      const reach = unit.radius + targetUnit.radius + unit.range;
      if (dist <= reach) {
        attackingTarget = { kind: 'unit', ref: targetUnit };
        unit.facingAngle = Math.atan2(targetUnit.y - unit.y, targetUnit.x - unit.x);
      } else {
        moveX = targetUnit.x;
        moveY = targetUnit.y;
      }
    } else if (targetTower) {
      const dist = Math.hypot(targetTower.x - unit.x, targetTower.y - unit.y);
      const reach = unit.radius + targetTower.radius + unit.range;
      if (dist <= reach) {
        attackingTarget = { kind: 'tower', ref: targetTower };
        unit.facingAngle = Math.atan2(targetTower.y - unit.y, targetTower.x - unit.x);
      } else {
        // Keep troops aligned with their lane bridge while crossing river
        const nearRiver = Math.abs(unit.y - RIVER_Y) < 48;
        if (nearRiver) {
          moveX = laneBridgeX(unit.lane);
          moveY = unit.team === 'blue' ? RIVER_Y - 58 : RIVER_Y + 58;
        } else {
          moveX = targetTower.x;
          moveY = targetTower.y;
        }
      }
    }

    if (attackingTarget) {
      unit.state = 'attacking';
      if (unit.attackTimer <= 0) {
        unit.attackTimer = unit.attackInterval;
        unit.attackSwing = 1.0;
        const isHeavy = unit.cardId === 'mainframe_golem';

        if (attackingTarget.kind === 'unit') {
          damageUnit(sim, attackingTarget.ref, unit.damage, isHeavy);
          soundEngine.playHit(isHeavy);
        } else {
          damageTower(sim, attackingTarget.ref, unit.damage, isHeavy);
          soundEngine.playHit(isHeavy);
          if (isHeavy) {
            spawnRing(
              sim,
              attackingTarget.ref.x,
              attackingTarget.ref.y,
              '#A78BFA',
              40,
              0.28
            );
          }
        }
      }
    } else {
      unit.state = 'moving';
      const dx = moveX - unit.x;
      const dy = moveY - unit.y;
      const len = Math.hypot(dx, dy);
      if (len > 0.5) {
        const step = Math.min(len, unit.speed * dt);
        unit.x += (dx / len) * step;
        unit.y += (dy / len) * step;
        unit.facingAngle = Math.atan2(dy, dx);
        unit.walkPhase += dt * (unit.speed * 0.18);
      }
    }
  }

  // Soft separation so same-team troops don't overlap completely
  for (let i = 0; i < sim.units.length; i++) {
    const a = sim.units[i];
    if (a.hp <= 0) continue;
    for (let j = i + 1; j < sim.units.length; j++) {
      const b = sim.units[j];
      if (b.hp <= 0) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minSep = (a.radius + b.radius) * 0.72;
      if (dist > 0.01 && dist < minSep) {
        const push = (minSep - dist) * 0.35;
        const nx = dx / dist;
        const ny = dy / dist;
        a.x -= nx * push;
        a.y -= ny * push;
        b.x += nx * push;
        b.y += ny * push;
      }
    }
  }

  // Update Towers (fire bolts at nearby enemy troops)
  for (const tower of sim.towers) {
    if (tower.destroyed) continue;
    tower.hitFlash = Math.max(0, tower.hitFlash - dt);
    tower.attackTimer = Math.max(0, tower.attackTimer - dt);

    const enemyTeam: Team = tower.team === 'blue' ? 'red' : 'blue';
    let closest: Unit | null = null;
    let closestDist = tower.range;

    for (const unit of sim.units) {
      if (unit.team !== enemyTeam || unit.hp <= 0) continue;
      const d = Math.hypot(unit.x - tower.x, unit.y - tower.y);
      if (d <= closestDist) {
        closestDist = d;
        closest = unit;
      }
    }

    if (closest) {
      tower.turretAngle = Math.atan2(closest.y - tower.y, closest.x - tower.x);
      if (tower.attackTimer <= 0) {
        tower.attackTimer = tower.attackInterval;
        sim.projectiles.push({
          id: sim.nextProjectileId++,
          team: tower.team,
          kind: 'tower_bolt',
          startX: tower.x,
          startY: tower.y - 6,
          x: tower.x,
          y: tower.y - 6,
          targetX: closest.x,
          targetY: closest.y,
          targetUnitId: closest.id,
          progress: 0,
          duration: 0.18,
          damage: tower.damage,
          splashRadius: 0,
          splashUnitDamage: 0,
        });
      }
    }
  }

  // Update Projectiles
  const remainingProj: Projectile[] = [];
  for (const proj of sim.projectiles) {
    proj.progress += dt / proj.duration;

    if (proj.kind === 'tower_bolt' && proj.targetUnitId !== undefined) {
      const target = sim.units.find((u) => u.id === proj.targetUnitId && u.hp > 0);
      if (target) {
        proj.targetX = target.x;
        proj.targetY = target.y;
      }
    }

    const t = Math.min(1, proj.progress);
    proj.x = proj.startX + (proj.targetX - proj.startX) * t;
    proj.y = proj.startY + (proj.targetY - proj.startY) * t;

    if (proj.kind === 'fireball' && Math.random() < 0.75) {
      sim.particles.push({
        x: proj.x + (Math.random() - 0.5) * 8,
        y: proj.y - Math.sin(t * Math.PI) * 38 + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 28,
        vy: (Math.random() - 0.5) * 28,
        life: 0.25,
        maxLife: 0.25,
        size: 4.5,
        color: Math.random() < 0.5 ? '#FB923C' : '#FDE047',
      });
    }

    if (proj.progress >= 1) {
      if (proj.kind === 'fireball') {
        resolveFireballImpact(sim, proj);
      } else if (proj.targetUnitId !== undefined) {
        const target = sim.units.find((u) => u.id === proj.targetUnitId && u.hp > 0);
        if (target) {
          damageUnit(sim, target, proj.damage, false);
        }
      }
    } else {
      remainingProj.push(proj);
    }
  }
  sim.projectiles = remainingProj;

  // Clean dead units
  sim.units = sim.units.filter((u) => u.hp > 0);

  // Update Particles
  const nextParticles: Particle[] = [];
  for (const p of sim.particles) {
    p.life -= dt;
    if (p.life <= 0) continue;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.94;
    p.vy *= 0.94;
    nextParticles.push(p);
  }
  sim.particles = nextParticles;

  // Update Floating Texts
  const nextTexts: FloatingText[] = [];
  for (const ft of sim.floatingTexts) {
    ft.life -= dt;
    if (ft.life <= 0) continue;
    ft.y += ft.vy * dt;
    nextTexts.push(ft);
  }
  sim.floatingTexts = nextTexts;

  // Check End Conditions
  const blueKingDestroyed =
    sim.towers.find((t) => t.id === 'blue_king')?.destroyed ?? false;
  const redKingDestroyed =
    sim.towers.find((t) => t.id === 'red_king')?.destroyed ?? false;

  if (blueKingDestroyed || redKingDestroyed) {
    sim.matchEnded = true;
    sim.result = computeResult(sim, 'king_destroyed');
    soundEngine.playMatchEnd(sim.result.winner === 'blue');
  } else if (sim.timeRemaining <= 0) {
    sim.matchEnded = true;
    sim.result = computeResult(sim);
    soundEngine.playMatchEnd(sim.result.winner === 'blue');
  }
}

export function getHudSnapshot(sim: ArenaSimState): HudSnapshot {
  const blueKing = sim.towers.find((t) => t.id === 'blue_king');
  const redKing = sim.towers.find((t) => t.id === 'red_king');

  const blueCrowns = sim.towers.filter(
    (t) => t.team === 'red' && t.destroyed
  ).length;
  const redCrowns = sim.towers.filter(
    (t) => t.team === 'blue' && t.destroyed
  ).length;

  const cpuLevel = getCpuLevel(sim.time);
  const currentInterval = getCpuSpawnInterval(cpuLevel);

  return {
    elixir: sim.elixir,
    timeRemaining: sim.timeRemaining,
    isDoubleElixir: sim.timeRemaining <= DOUBLE_ELIXIR_THRESHOLD,
    cpuLevel,
    blueCrowns,
    redCrowns,
    blueKingHp: blueKing?.hp ?? 0,
    blueKingMaxHp: blueKing?.maxHp ?? 1650,
    redKingHp: redKing?.hp ?? 0,
    redKingMaxHp: redKing?.maxHp ?? 1650,
    cpuCooldownProgress: Math.max(
      0,
      Math.min(1, 1 - sim.cpuSpawnTimer / currentInterval)
    ),
  };
}
