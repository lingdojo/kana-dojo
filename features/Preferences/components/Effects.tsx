'use client';
import { useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { buttonBorderStyles } from '@/shared/lib/styles';
import {
  CURSOR_TRAIL_EFFECTS,
  CLICK_EFFECTS,
  KANJI_POOL,
} from '../data/effectsData';
import CollapsibleSection from './CollapsibleSection';
import { MousePointer2, Zap } from 'lucide-react';

// ─── Mini preview canvas ──────────────────────────────────────────────────────

function EffectPreviewCanvas({
  effectId,
  emoji,
  group,
}: {
  effectId: string;
  emoji: string;
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

    // "None" — dashed line
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

    const isKanji = effectId === 'kanji';

    // ── Cursor trail previews ──────────────────────────────────────────────
    if (group === 'cursor-trail') {
      const count = 5;
      for (let i = 0; i < count; i++) {
        const progress = (t * 0.38 + i / count) % 1;
        const px = W * 0.1 + progress * W * 0.8;
        const py = cy + Math.sin(progress * Math.PI * 3.5) * (H * 0.22);
        const age = 1 - progress;
        const em = isKanji ? KANJI_POOL[i % KANJI_POOL.length] : emoji;
        const sz = (10 + Math.sin(i) * 2) * age;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((Math.random() - 0.5) * 0.15);
        ctx.globalAlpha = age;
        ctx.font = `${Math.max(4, sz)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(em, 0, 0);
        ctx.restore();
      }
      // Cursor arrow
      const cp = (t * 0.38) % 1;
      const cursorX = W * 0.1 + cp * W * 0.8;
      const cursorY = cy + Math.sin(cp * Math.PI * 3.5) * (H * 0.22);
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#aaa';
      ctx.beginPath();
      ctx.moveTo(cursorX, cursorY);
      ctx.lineTo(cursorX + 4, cursorY + 9);
      ctx.lineTo(cursorX + 1.5, cursorY + 7.5);
      ctx.lineTo(cursorX + 1.5, cursorY + 12);
      ctx.lineTo(cursorX - 1.5, cursorY + 12);
      ctx.lineTo(cursorX - 1.5, cursorY + 7.5);
      ctx.lineTo(cursorX - 4, cursorY + 9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // ── Click effect previews (looping burst) ────────────────────────────────
    if (group === 'click') {
      const raw = (t * 0.5) % 1;
      const burst = raw < 0.7 ? raw / 0.7 : 0;
      const n = 6;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const dist = burst * 22;
        const alpha = Math.max(0, 1 - burst * 1.15);
        const sz = (11 + Math.sin(i) * 2) * alpha;
        ctx.save();
        ctx.translate(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist);
        ctx.rotate(a + t);
        ctx.globalAlpha = alpha;
        ctx.font = `${Math.max(4, sz)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 0, 0);
        ctx.restore();
      }
    }
  }, [effectId, emoji, group]);

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
  emoji,
  isSelected,
  onSelect,
  group,
}: {
  id: string;
  name: string;
  emoji: string;
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
      <EffectPreviewCanvas effectId={id} emoji={emoji} group={group} />
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
              emoji={effect.emoji}
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
              emoji={effect.emoji}
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
