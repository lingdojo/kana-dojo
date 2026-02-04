'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useClick } from '@/shared/hooks/useAudio';
import { allKana } from '../data/kanaData';
import { Eraser, Download, Palette, Undo, Type } from 'lucide-react';
import clsx from 'clsx';

export default function KanaTrace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ff4e50');
  const [brushSize, setBrushSize] = useState(8);
  const [targetKana, setTargetKana] = useState(allKana[0]);
  const [showReference, setShowReference] = useState(true);
  const { playClick } = useClick();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions with high DPI support
    const displayWidth = canvas.parentElement?.clientWidth || 400;
    const displayHeight = canvas.parentElement?.clientHeight || 400;
    const scale = window.devicePixelRatio || 1;

    canvas.width = displayWidth * scale;
    canvas.height = displayHeight * scale;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    ctx.scale(scale, scale);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
  }, [currentColor, brushSize]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const nextKana = () => {
    playClick();
    setTargetKana(allKana[Math.floor(Math.random() * allKana.length)]);
    clearCanvas();
  };

  const downloadImage = () => {
    playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `kana-trace-${targetKana.romanji}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className='flex min-h-[85vh] flex-1 flex-col gap-6'>
      <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
        <div>
          <h1 className='text-3xl font-bold text-(--main-color)'>
            Kana Trace
          </h1>
          <p className='text-(--secondary-color)'>
            Practice drawing strokes in a relaxing way
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setShowReference(!showReference)}
            className={clsx(
              'rounded-xl border p-3 transition-all',
              showReference
                ? 'border-(--main-color) bg-(--main-color) text-white'
                : 'border-(--border-color) bg-(--card-color) text-(--secondary-color)',
            )}
            title='Toggle Reference'
          >
            <Type size={20} />
          </button>
          <button
            onClick={clearCanvas}
            className='rounded-xl border border-(--border-color) bg-(--card-color) p-3 text-(--secondary-color) transition-all hover:border-red-400 hover:text-red-400'
            title='Clear Canvas'
          >
            <Eraser size={20} />
          </button>
          <button
            onClick={downloadImage}
            className='rounded-xl border border-(--border-color) bg-(--card-color) p-3 text-(--secondary-color) transition-all hover:border-(--main-color) hover:text-(--main-color)'
            title='Download Practice'
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className='flex flex-1 flex-col gap-6 lg:flex-row'>
        {/* Main Canvas Area */}
        <div className='relative flex-1 overflow-hidden rounded-3xl border-2 border-dashed border-(--border-color) bg-(--card-color)'>
          {/* Reference Kana (Background) */}
          {showReference && (
            <div className='pointer-events-none absolute inset-0 flex items-center justify-center opacity-10 select-none'>
              <span className='text-[20rem] font-bold text-(--main-color)'>
                {targetKana.kana}
              </span>
            </div>
          )}

          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className='relative z-10 h-full w-full cursor-crosshair touch-none'
          />
        </div>

        {/* Controls Sidebar */}
        <div className='flex w-full flex-col gap-6 lg:w-64'>
          <div className='rounded-2xl border border-(--border-color) bg-(--card-color) p-6'>
            <h2 className='mb-4 text-sm font-bold tracking-widest text-(--secondary-color) uppercase'>
              Current Target
            </h2>
            <div className='flex items-center gap-4'>
              <div className='flex h-16 w-16 items-center justify-center rounded-xl bg-(--main-color)/10 text-3xl font-bold text-(--main-color)'>
                {targetKana.kana}
              </div>
              <div>
                <p className='text-xl font-bold text-(--main-color) capitalize'>
                  {targetKana.romanji}
                </p>
                <button
                  onClick={nextKana}
                  className='text-xs text-(--secondary-color) underline underline-offset-2 hover:text-(--main-color)'
                >
                  Change Target
                </button>
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-(--border-color) bg-(--card-color) p-6'>
            <h2 className='mb-4 text-sm font-bold tracking-widest text-(--secondary-color) uppercase'>
              Settings
            </h2>
            <div className='space-y-6'>
              <div>
                <label className='mb-2 block text-sm text-(--secondary-color)'>
                  Brush Color
                </label>
                <div className='flex flex-wrap gap-2'>
                  {[
                    '#ff4e50',
                    '#8e44ad',
                    '#2ecc71',
                    '#3498db',
                    '#f1c40f',
                    '#e67e22',
                  ].map(color => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className={clsx(
                        'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                        currentColor === color
                          ? 'scale-110 border-white shadow-lg'
                          : 'border-transparent',
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className='mb-2 block text-sm text-(--secondary-color)'>
                  Brush Size: {brushSize}px
                </label>
                <input
                  type='range'
                  min='2'
                  max='20'
                  value={brushSize}
                  onChange={e => setBrushSize(parseInt(e.target.value))}
                  className='w-full accent-(--main-color)'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
