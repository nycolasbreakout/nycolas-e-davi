import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  BRIDGE_WIDTH,
  LEFT_BRIDGE_X,
  RIGHT_BRIDGE_X,
  RIVER_HALF_HEIGHT,
  RIVER_Y,
} from '../data/cards';
import type { Lane, Tower, Unit } from '../types/game';
import type { ArenaSimState } from './simulation';

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawArenaBackground(
  ctx: CanvasRenderingContext2D,
  time: number,
  selectedLane: Lane,
  showLaneSelector: boolean
) {
  // Mowed turf grass stripes
  const stripeCount = 12;
  const stripeH = ARENA_HEIGHT / stripeCount;
  for (let i = 0; i < stripeCount; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#1F6E43' : '#247B4B';
    ctx.fillRect(0, i * stripeH, ARENA_WIDTH, stripeH + 0.5);
  }

  // Subtle turf border bevel
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, ARENA_WIDTH - 6, ARENA_HEIGHT - 6);

  // Subtle territory tint: Red top, Blue bottom
  ctx.fillStyle = 'rgba(220, 38, 38, 0.05)';
  ctx.fillRect(0, 0, ARENA_WIDTH, RIVER_Y - RIVER_HALF_HEIGHT);
  ctx.fillStyle = 'rgba(37, 99, 235, 0.05)';
  ctx.fillRect(0, RIVER_Y + RIVER_HALF_HEIGHT, ARENA_WIDTH, ARENA_HEIGHT - RIVER_Y);

  // Stone lane paths (Left & Right) + King connectors
  ctx.fillStyle = '#B8A88A';
  const laneW = 46;
  // Left lane path
  drawRoundedRect(ctx, LEFT_BRIDGE_X - laneW / 2, 54, laneW, ARENA_HEIGHT - 108, 12);
  ctx.fill();
  // Right lane path
  drawRoundedRect(ctx, RIGHT_BRIDGE_X - laneW / 2, 54, laneW, ARENA_HEIGHT - 108, 12);
  ctx.fill();

  // Horizontal King connector paths
  drawRoundedRect(
    ctx,
    LEFT_BRIDGE_X - 18,
    54 - 16,
    RIGHT_BRIDGE_X - LEFT_BRIDGE_X + 36,
    32,
    10
  );
  ctx.fill();
  drawRoundedRect(
    ctx,
    LEFT_BRIDGE_X - 18,
    ARENA_HEIGHT - 54 - 16,
    RIGHT_BRIDGE_X - LEFT_BRIDGE_X + 36,
    32,
    10
  );
  ctx.fill();

  // Subtle stone tile joints along paths
  ctx.strokeStyle = 'rgba(71, 56, 38, 0.16)';
  ctx.lineWidth = 1;
  for (let y = 70; y < ARENA_HEIGHT - 65; y += 26) {
    if (Math.abs(y - RIVER_Y) < 32) continue;
    ctx.beginPath();
    ctx.moveTo(LEFT_BRIDGE_X - laneW / 2 + 4, y);
    ctx.lineTo(LEFT_BRIDGE_X + laneW / 2 - 4, y);
    ctx.moveTo(RIGHT_BRIDGE_X - laneW / 2 + 4, y);
    ctx.lineTo(RIGHT_BRIDGE_X + laneW / 2 - 4, y);
    ctx.stroke();
  }

  // Selected Lane Highlight Overlay on Blue Half
  if (showLaneSelector) {
    const activeX = selectedLane === 'left' ? LEFT_BRIDGE_X : RIGHT_BRIDGE_X;
    const grad = ctx.createLinearGradient(0, RIVER_Y + 24, 0, ARENA_HEIGHT - 120);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.24)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.02)');
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, activeX - 36, RIVER_Y + 26, 72, 160, 14);
    ctx.fill();

    // Animated chevron pointing north at the selected bridge approach
    const bob = Math.sin(time * 5) * 4;
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(activeX - 12, RIVER_Y + 60 + bob);
    ctx.lineTo(activeX, RIVER_Y + 48 + bob);
    ctx.lineTo(activeX + 12, RIVER_Y + 60 + bob);
    ctx.stroke();
  }

  // River across the middle
  const riverTop = RIVER_Y - RIVER_HALF_HEIGHT;
  const riverGrad = ctx.createLinearGradient(0, riverTop, 0, riverTop + RIVER_HALF_HEIGHT * 2);
  riverGrad.addColorStop(0, '#0284C7');
  riverGrad.addColorStop(0.5, '#0EA5E9');
  riverGrad.addColorStop(1, '#0369A1');
  ctx.fillStyle = riverGrad;
  ctx.fillRect(0, riverTop, ARENA_WIDTH, RIVER_HALF_HEIGHT * 2);

  // River banks
  ctx.fillStyle = '#5C4033';
  ctx.fillRect(0, riverTop - 4, ARENA_WIDTH, 5);
  ctx.fillRect(0, riverTop + RIVER_HALF_HEIGHT * 2 - 1, ARENA_WIDTH, 5);

  // Flowing water ripples (circuit-inspired crisp streaks)
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const flowX = ((i * 78 + time * 32) % (ARENA_WIDTH + 60)) - 30;
    const flowY = RIVER_Y - 12 + (i % 3) * 11;
    ctx.beginPath();
    ctx.moveTo(flowX, flowY);
    ctx.lineTo(flowX + 24, flowY);
    ctx.stroke();
  }

  // Two Bridges (Left & Right)
  const bridges: Array<{ x: number; lane: Lane }> = [
    { x: LEFT_BRIDGE_X, lane: 'left' },
    { x: RIGHT_BRIDGE_X, lane: 'right' },
  ];

  for (const b of bridges) {
    const bx = b.x - BRIDGE_WIDTH / 2;
    const by = riverTop - 7;
    const bh = RIVER_HALF_HEIGHT * 2 + 14;
    const isSelected = showLaneSelector && selectedLane === b.lane;

    // Bridge shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    drawRoundedRect(ctx, bx + 2, by + 4, BRIDGE_WIDTH, bh, 6);
    ctx.fill();

    // Bridge timber deck
    ctx.fillStyle = '#925E36';
    drawRoundedRect(ctx, bx, by, BRIDGE_WIDTH, bh, 6);
    ctx.fill();

    // Planks
    ctx.strokeStyle = '#6B4223';
    ctx.lineWidth = 1.5;
    for (let py = by + 7; py < by + bh - 4; py += 9) {
      ctx.beginPath();
      ctx.moveTo(bx + 5, py);
      ctx.lineTo(bx + BRIDGE_WIDTH - 5, py);
      ctx.stroke();
    }

    // Bridge side rails
    ctx.fillStyle = isSelected ? '#38BDF8' : '#475569';
    ctx.fillRect(bx - 2, by, 6, bh);
    ctx.fillRect(bx + BRIDGE_WIDTH - 4, by, 6, bh);

    // Subtle bridge label
    ctx.font = '700 9px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isSelected ? '#E0F2FE' : 'rgba(255,255,255,0.6)';
    ctx.fillText(b.lane === 'left' ? 'ESQ' : 'DIR', b.x, RIVER_Y + 3);
  }
}

function drawHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  hp: number,
  maxHp: number,
  team: 'blue' | 'red',
  showNumeric = false
) {
  const ratio = Math.max(0, Math.min(1, hp / maxHp));
  const left = x - width / 2;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  drawRoundedRect(ctx, left - 1, y - 1, width + 2, height + 2, 4);
  ctx.fill();

  ctx.fillStyle = team === 'blue' ? '#3B82F6' : '#EF4444';
  if (ratio > 0) {
    drawRoundedRect(ctx, left, y, Math.max(3, width * ratio), height, 3);
    ctx.fill();
  }

  // Highlight sheen
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  if (ratio > 0) {
    ctx.fillRect(left + 1, y + 0.5, Math.max(1, width * ratio - 2), height * 0.35);
  }

  if (showNumeric) {
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.lineWidth = 3;
    const label = `${Math.ceil(hp)}`;
    ctx.strokeText(label, x, y - 4);
    ctx.fillText(label, x, y - 4);
  }
}

function drawTower(ctx: CanvasRenderingContext2D, tower: Tower) {
  const { x, y, radius, team, kind, destroyed, hitFlash } = tower;

  if (destroyed) {
    // Scorched rubble crater
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.95, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6 + 0.3;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(a) * radius * 0.48,
        y + Math.sin(a) * radius * 0.48,
        5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    return;
  }

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  drawRoundedRect(ctx, x - radius + 3, y - radius + 6, radius * 2, radius * 2, 10);
  ctx.fill();

  // Outer stone bastion
  ctx.fillStyle = hitFlash > 0 ? '#FFFFFF' : '#CBD5E1';
  drawRoundedRect(ctx, x - radius, y - radius, radius * 2, radius * 2, 10);
  ctx.fill();

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Team roof trim
  const teamFill =
    hitFlash > 0 ? '#FEF08A' : team === 'blue' ? '#2563EB' : '#DC2626';
  const teamHighlight = team === 'blue' ? '#60A5FA' : '#F87171';
  const inner = radius - 6;

  ctx.fillStyle = teamFill;
  drawRoundedRect(ctx, x - inner, y - inner, inner * 2, inner * 2, 7);
  ctx.fill();

  // Corner battlements
  ctx.fillStyle = '#E2E8F0';
  const bSize = 7;
  const offsets = [
    [-radius + 1, -radius + 1],
    [radius - bSize - 1, -radius + 1],
    [-radius + 1, radius - bSize - 1],
    [radius - bSize - 1, radius - bSize - 1],
  ];
  for (const [ox, oy] of offsets) {
    drawRoundedRect(ctx, x + ox, y + oy, bSize, bSize, 2);
    ctx.fill();
  }

  // Rotating turret crystal / crown emblem
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tower.turretAngle);

  // Barrel
  ctx.fillStyle = '#0F172A';
  drawRoundedRect(ctx, 2, -4, radius * 0.62, 8, 3);
  ctx.fill();
  ctx.fillStyle = teamHighlight;
  drawRoundedRect(ctx, 4, -2.2, radius * 0.52, 4.4, 2);
  ctx.fill();
  ctx.restore();

  // Center cap (King crown vs Princess gem)
  ctx.beginPath();
  ctx.arc(x, y, kind === 'king' ? 11 : 8, 0, Math.PI * 2);
  ctx.fillStyle = kind === 'king' ? '#FBBF24' : '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;
  ctx.stroke();

  if (kind === 'king') {
    ctx.fillStyle = '#92400E';
    ctx.font = '800 10px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('K', x, y + 0.5);
  }

  // HP bar above tower
  drawHealthBar(
    ctx,
    x,
    y - radius - 14,
    kind === 'king' ? 66 : 54,
    7,
    tower.hp,
    tower.maxHp,
    team,
    true
  );
}

function drawUnit(ctx: CanvasRenderingContext2D, unit: Unit) {
  const bob = unit.state === 'moving' ? Math.sin(unit.walkPhase) * 2.2 : 0;
  const lunge = unit.attackSwing > 0 ? Math.sin(unit.attackSwing * Math.PI) * 5 : 0;

  const drawX = unit.x + Math.cos(unit.facingAngle) * lunge;
  const drawY = unit.y + Math.sin(unit.facingAngle) * lunge + bob * 0.6;

  const isBlue = unit.team === 'blue';
  const primary =
    unit.hitFlash > 0 ? '#FFFFFF' : isBlue ? '#2563EB' : '#DC2626';
  const secondary = isBlue ? '#38BDF8' : '#FCA5A5';

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(unit.x, unit.y + unit.radius * 0.65, unit.radius * 0.9, unit.radius * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Team ring
  ctx.strokeStyle = secondary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(drawX, drawY, unit.radius + 1.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(drawX, drawY);
  ctx.rotate(unit.facingAngle);

  if (unit.cardId === 'fast_bit') {
    // Sleek cyber dart / chevron runner
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(unit.radius + 3, 0);
    ctx.lineTo(-unit.radius * 0.85, -unit.radius * 0.85);
    ctx.lineTo(-unit.radius * 0.35, 0);
    ctx.lineTo(-unit.radius * 0.85, unit.radius * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing core
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(2, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (unit.cardId === 'loop_knight') {
    // Armored knight with shield + blade swing
    // Sword arc when attacking
    if (unit.attackSwing > 0) {
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(4, 0, unit.radius + 8, -0.9, 0.9);
      ctx.stroke();
    }

    // Sword
    ctx.fillStyle = '#E2E8F0';
    drawRoundedRect(ctx, 4, 5, 16, 4, 2);
    ctx.fill();

    // Body armor
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, unit.radius - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Shield on front-left
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.arc(5, -7, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Visor
    ctx.fillStyle = '#F8FAFC';
    drawRoundedRect(ctx, 2, -4, 6, 8, 2);
    ctx.fill();
  } else {
    // Golem Mainframe: heavy octagonal colossus with glowing logic symbol
    const r = unit.radius;
    ctx.fillStyle = unit.hitFlash > 0 ? '#FFFFFF' : isBlue ? '#1E3A8A' : '#7F1D1D';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8 + Math.PI / 8;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Heavy fists
    const punch = unit.attackSwing > 0 ? 6 : 0;
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(r * 0.55 + punch, -r * 0.72, 7, 0, Math.PI * 2);
    ctx.arc(r * 0.55 + punch, r * 0.72, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing core
    ctx.fillStyle = isBlue ? '#38BDF8' : '#FB7185';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // HP bar above unit
  drawHealthBar(
    ctx,
    drawX,
    drawY - unit.radius - 10,
    unit.cardId === 'mainframe_golem' ? 38 : 28,
    5,
    unit.hp,
    unit.maxHp,
    unit.team,
    false
  );
}

export function renderArena(
  ctx: CanvasRenderingContext2D,
  sim: ArenaSimState,
  selectedLane: Lane,
  showLaneSelector = true
) {
  ctx.save();

  if (sim.screenShake > 0) {
    const sx = (Math.random() - 0.5) * sim.screenShake;
    const sy = (Math.random() - 0.5) * sim.screenShake;
    ctx.translate(sx, sy);
  }

  drawArenaBackground(ctx, sim.time, selectedLane, showLaneSelector);

  // Towers
  for (const tower of sim.towers) {
    drawTower(ctx, tower);
  }

  // Units sorted by Y for crisp top-down overlap
  const sortedUnits = [...sim.units].sort((a, b) => a.y - b.y);
  for (const unit of sortedUnits) {
    drawUnit(ctx, unit);
  }

  // Projectiles
  for (const proj of sim.projectiles) {
    if (proj.kind === 'fireball') {
      const arcOffset = Math.sin(Math.min(1, proj.progress) * Math.PI) * 42;
      const fx = proj.x;
      const fy = proj.y - arcOffset;

      // Target reticle on ground
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.75)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(proj.targetX, proj.targetY, proj.splashRadius * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(proj.x, proj.y, 12, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Blazing fireball orb
      const grad = ctx.createRadialGradient(fx, fy, 2, fx, fy, 17);
      grad.addColorStop(0, '#FEF08A');
      grad.addColorStop(0.5, '#F97316');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, 17, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = proj.team === 'blue' ? '#60A5FA' : '#F87171';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Particles & shockwave rings
  for (const p of sim.particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (p.ring) {
      const radius = p.size * (1 - alpha * 0.65);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Floating combat / elixir text
  for (const ft of sim.floatingTexts) {
    const alpha = Math.max(0, ft.life / ft.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `800 ${ft.size}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.lineWidth = 3.5;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore();
}
