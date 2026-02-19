'use client';
import { useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { buttonBorderStyles } from '@/shared/lib/styles';
import {
  CURSOR_TRAIL_EFFECTS,
  CLICK_EFFECTS,
  type RenderStyle,
} from '../data/effectsData';
import {
  preloadEffectImages,
  getEffectImage,
  EFFECT_SVG_ASPECT,
} from '../data/effectImages';
import CollapsibleSection from './CollapsibleSection';
import { MousePointer2, Zap } from 'lucide-react';

// ─── All SVG IDs we need for previews ─────────────────────────────────────────

const ALL_SVG_IDS = ['sakura', 'momiji', 'ink-drop', 'koi', 'firefly', 'torii'];

// ─── Render-style badge ───────────────────────────────────────────────────────

function StyleBadge({ style }: { style: RenderStyle }) {
  if (style === 'canvas') return null;
  return (
    <span
      className={clsx(
        'absolute top-1.5 right-1.5 rounded px-1 py-0.5',
        'text-[9px] leading-none font-semibold tracking-wide uppercase',
        style === 'svg'
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-orange-500/20 text-orange-400',
      )}
    >
      {style === 'svg' ? 'SVG' : 'EMOJI'}
    </span>
  );
}

// ─── Mini preview canvas ──────────────────────────────────────────────────────

/**
 * Draws a looping animated preview of the given effect inside a small canvas.
 * SVG effects: uses getEffectImage() + ctx.drawImage()
 * Emoji effects: uses ctx.fillText()
 * Canvas effects: simple geometric shape
 */
function EffectPreviewCanvas({
  effectId,
  group,
}: {
  effectId: string;
  group: 'cursor-trail' | 'click';
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const t = Date.now() / 1000;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);

    // Helper: draw one SVG image particle
    const drawImg = (
      id: string,
      px: number,
      py: number,
      size: number,
      rot: number,
      alpha: number,
    ) => {
      const img = getEffectImage(id);
      if (!img) return;
      const aspect = EFFECT_SVG_ASPECT[id] ?? 1;
      const w = size;
      const h = size * aspect;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    };

    // Helper: draw one emoji/text particle
    const drawEmoji = (
      em: string,
      px: number,
      py: number,
      size: number,
      rot: number,
      alpha: number,
    ) => {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.font = `${size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(em, 0, 0);
      ctx.restore();
    };

    // ── "None" — dashed line ───────────────────────────────────────────────
    if (effectId === 'none') {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(W * 0.2, cy);
      ctx.lineTo(W * 0.8, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }

    // ── Cursor trail previews ──────────────────────────────────────────────
    if (group === 'cursor-trail') {
      const count = 6;
      for (let i = 0; i < count; i++) {
        const progress = (t * 0.38 + i / count) % 1;
        const px = W * 0.12 + progress * W * 0.76;
        const py = cy + Math.sin(progress * Math.PI * 3.5) * (H * 0.22);
        const age = 1 - progress;

        switch (effectId) {
          case 'sakura':
            drawImg(
              'sakura',
              px,
              py,
              (12 + Math.sin(i) * 2) * age,
              t + i,
              age * 0.95,
            );
            break;
          case 'momiji':
            drawImg(
              'momiji',
              px,
              py,
              (13 + Math.sin(i) * 2) * age,
              t * 1.2 + i,
              age,
            );
            break;
          case 'ink-drop':
            drawImg(
              'ink-drop',
              px,
              py,
              (11 + i * 0.5) * age,
              -Math.PI / 2 + (Math.random() - 0.5) * 0.3,
              age * 0.9,
            );
            break;
          case 'koi': {
            const dx = Math.cos(t * 0.4) * 0.5;
            const angle = Math.atan2(0.1, dx);
            drawImg('koi', px, py, (16 + i * 0.5) * age, angle, age * 0.85);
            break;
          }
          case 'firefly': {
            const pulse = 0.65 + 0.35 * Math.sin(t * 4 + i * 1.8);
            drawImg(
              'firefly',
              px,
              py - progress * 6,
              (12 + i * 0.5) * age,
              0,
              age * pulse,
            );
            break;
          }
          case 'kanji': {
            const chars = ['花', '道', '愛', '心', '雪', '月'];
            drawEmoji(
              chars[i % chars.length],
              px,
              py - progress * 5,
              (13 + i * 0.5) * age,
              (Math.random() - 0.5) * 0.15,
              age,
            );
            break;
          }
        }
      }

      // Cursor arrow indicator
      const cp = (t * 0.38) % 1;
      const cursorX = W * 0.12 + cp * W * 0.76;
      const cursorY = cy + Math.sin(cp * Math.PI * 3.5) * (H * 0.22);
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#aaa';
      ctx.beginPath();
      ctx.moveTo(cursorX, cursorY);
      ctx.lineTo(cursorX + 4, cursorY + 10);
      ctx.lineTo(cursorX + 1.5, cursorY + 8.5);
      ctx.lineTo(cursorX + 1.5, cursorY + 13);
      ctx.lineTo(cursorX - 1.5, cursorY + 13);
      ctx.lineTo(cursorX - 1.5, cursorY + 8.5);
      ctx.lineTo(cursorX - 4, cursorY + 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // ── Click effect previews ─────────────────────────────────────────────
    if (group === 'click') {
      // Cycle: 0→1 then drop instantly → loop every 2 s
      const raw = (t * 0.5) % 1;
      const burst = raw < 0.7 ? raw / 0.7 : 0; // expand for 70% of cycle, reset

      switch (effectId) {
        case 'sakura-burst': {
          const n = 8;
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const dist = burst * 24;
            drawImg(
              'sakura',
              cx + Math.cos(a) * dist,
              cy + Math.sin(a) * dist,
              (10 + Math.sin(i) * 2) * Math.max(0, 1 - burst * 1.1),
              a + t * 1.5,
              Math.max(0, 1 - burst * 1.1),
            );
          }
          break;
        }
        case 'ink-splash': {
          const n = 8;
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const dist = burst * 22;
            drawImg(
              'ink-drop',
              cx + Math.cos(a) * dist,
              cy + Math.sin(a) * dist,
              9 * Math.max(0, 1 - burst * 1.1),
              a + Math.PI / 2,
              Math.max(0, 1 - burst * 1.1) * 0.9,
            );
          }
          break;
        }
        case 'torii': {
          const n = 5;
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + Math.PI / 10;
            const dist = burst * 24;
            drawImg(
              'torii',
              cx + Math.cos(a) * dist,
              cy + Math.sin(a) * dist,
              11 * Math.max(0, 1 - burst * 1.1),
              a + t * 0.8,
              Math.max(0, 1 - burst * 1.1),
            );
          }
          break;
        }
        case 'shockwave': {
          const r = 4 + burst * 30;
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - burst) * 0.9;
          ctx.strokeStyle = '#B0B8D0';
          ctx.lineWidth = 1.8 * Math.max(0, 1 - burst);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
        }
        case 'momiji-rain': {
          const n = 7;
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const dist = burst * 22;
            drawEmoji(
              '🍂',
              cx + Math.cos(a) * dist,
              cy + Math.sin(a) * dist + burst * 4,
              (12 + Math.sin(i) * 2) * Math.max(0, 1 - burst * 1.1),
              t * 1.5 + i,
              Math.max(0, 1 - burst * 1.1),
            );
          }
          break;
        }
        case 'festival': {
          const pool = ['🏮', '🌸', '🎋', '🪷', '✨'];
          const n = 7;
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const dist = burst * 24;
            drawEmoji(
              pool[i % pool.length],
              cx + Math.cos(a) * dist,
              cy + Math.sin(a) * dist,
              (13 + Math.sin(i) * 2) * Math.max(0, 1 - burst * 1.1),
              0,
              Math.max(0, 1 - burst * 1.1),
            );
          }
          break;
        }
      }
    }
  }, [effectId, group]);

  useEffect(() => {
    let mounted = true;
    const loop = () => {
      if (!mounted) return;
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={60}
      style={{ display: 'block', width: '100%', height: 56 }}
      aria-hidden='true'
    />
  );
}

// ─── Effect card ─────────────────────────────────────────────────────────────

function EffectCard({
  id,
  name,
  renderStyle,
  isSelected,
  onSelect,
  group,
}: {
  id: string;
  name: string;
  renderStyle: RenderStyle;
  isSelected: boolean;
  onSelect: () => void;
  group: 'cursor-trail' | 'click';
}) {
  return (
    <label
      className={clsx(
        'relative flex flex-col items-center justify-between gap-2',
        buttonBorderStyles,
        'border-1 border-(--card-color)',
        'cursor-pointer px-3 py-3',
        'overflow-hidden',
      )}
      style={{
        outline: isSelected ? '3px solid var(--secondary-color)' : 'none',
        transition: 'background-color 275ms',
      }}
    >
      <input
        type='radio'
        name={`effect-${group}`}
        className='hidden'
        onChange={onSelect}
        checked={isSelected}
      />
      <StyleBadge style={renderStyle} />
      <EffectPreviewCanvas effectId={id} group={group} />
      <span className='text-center text-sm leading-tight'>{name}</span>
    </label>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const Effects = () => {
  const cursorTrailEffect = usePreferencesStore(s => s.cursorTrailEffect);
  const setCursorTrailEffect = usePreferencesStore(s => s.setCursorTrailEffect);
  const clickEffect = usePreferencesStore(s => s.clickEffect);
  const setClickEffect = usePreferencesStore(s => s.setClickEffect);

  // Kick off image pre-loading for all previews on mount
  useEffect(() => {
    preloadEffectImages(ALL_SVG_IDS);
  }, []);

  return (
    <div className='flex flex-col gap-6'>
      {/* Cursor Trail — desktop only */}
      <CollapsibleSection
        title={
          <span className='flex items-center gap-2'>
            Cursor Trail
            <span className='rounded-md bg-(--card-color) px-1.5 py-0.5 text-xs text-(--secondary-color)'>
              desktop only
            </span>
          </span>
        }
        icon={<MousePointer2 size={18} />}
        level='subsubsection'
        defaultOpen={true}
        storageKey='prefs-effects-cursor'
      >
        <fieldset className='grid grid-cols-2 gap-4 p-1 md:grid-cols-3 lg:grid-cols-4'>
          {CURSOR_TRAIL_EFFECTS.map(effect => (
            <EffectCard
              key={effect.id}
              id={effect.id}
              name={effect.name}
              renderStyle={effect.renderStyle}
              isSelected={cursorTrailEffect === effect.id}
              onSelect={() => setCursorTrailEffect(effect.id)}
              group='cursor-trail'
            />
          ))}
        </fieldset>
      </CollapsibleSection>

      {/* Click / Tap Effects — all devices */}
      <CollapsibleSection
        title='Click Effects'
        icon={<Zap size={18} />}
        level='subsubsection'
        defaultOpen={true}
        storageKey='prefs-effects-click'
      >
        <fieldset className='grid grid-cols-2 gap-4 p-1 md:grid-cols-3 lg:grid-cols-4'>
          {CLICK_EFFECTS.map(effect => (
            <EffectCard
              key={effect.id}
              id={effect.id}
              name={effect.name}
              renderStyle={effect.renderStyle}
              isSelected={clickEffect === effect.id}
              onSelect={() => setClickEffect(effect.id)}
              group='click'
            />
          ))}
        </fieldset>
      </CollapsibleSection>
    </div>
  );
};

export default Effects;
