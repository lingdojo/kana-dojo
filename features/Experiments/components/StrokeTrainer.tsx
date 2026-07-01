'use client';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { strokeDatabase } from '../data/strokeData';
import { Sparkles, RotateCcw, Check } from 'lucide-react';

const StrokeTrainer = () => {
  const [currentKanaKey, setCurrentKanaKey] = useState<string>('あ');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnStrokesCount, setDrawnStrokesCount] = useState(0);
  const [score, setScore] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentData = strokeDatabase[currentKanaKey];

  const strokeColor = '#fdcc2b';

  // تنظیمات اولیه بوم نقاشی
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 15;
      ctx.strokeStyle = strokeColor;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setDrawnStrokesCount(0);
    setScore(null);
  };

  // تغییر حرف و ریست کردن بوم
  const changeKana = (k: string) => {
    setCurrentKanaKey(k);
    clearCanvas();
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (score !== null) return; // اگر نتیجه باز شده، دیگر نقاشی نکند

    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || score !== null) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setDrawnStrokesCount(prev => prev + 1); // هر بار که قلم برداشته می‌شود، یک حرکت شمرده می‌شود
    }
  };

  // سیستم بررسی و امتیازدهی
  const checkScore = () => {
    const expectedStrokes = currentData.paths.length;

    if (drawnStrokesCount === 0) {
      setScore(0);
      return;
    }

    let calculatedScore = 100;

    // مقایسه تعداد حرکات رسم شده با استاندارد
    if (drawnStrokesCount === expectedStrokes) {
      // عالی! تعداد حرکت درست است. یک امتیاز تصادفی بین ۹۰ تا ۱۰۰
      calculatedScore = Math.floor(Math.random() * 11) + 90;
    } else {
      // کسر امتیاز به ازای خطوط اضافه یا کم
      const diff = Math.abs(expectedStrokes - drawnStrokesCount);
      calculatedScore = Math.max(10, 85 - (diff * 25) + Math.floor(Math.random() * 10));
    }

    setScore(calculatedScore);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 p-4 font-sans">


      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br from-(--main-color)/20 to-transparent shadow-[inset_0_4px_20px_rgba(0,0,0,0.05)] border border-(--main-color)/30">
          <div className="absolute inset-0 rounded-full animate-pulse bg-(--main-color)/10 blur-xl"></div>
          <span lang="ja" className="relative z-10 text-8xl font-black text-(--main-color) drop-shadow-sm">
            {currentKanaKey}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold tracking-[0.3em] uppercase text-(--secondary-color)">
            {currentData.romanji}
          </span>
          <span className="text-sm text-(--secondary-color)/70 mt-1">
            {currentData.paths.length} Move (Strokes)
          </span>
        </div>
      </div>

      {/* 2. Main Drawing Area (بوم نقاشی و پوسته) */}
      <div className="relative h-72 w-72 md:h-80 md:w-80 rounded-3xl border-4 border-(--border-color) bg-(--card-color) shadow-lg overflow-hidden group">

        {/* انیمیشن SVG در پس‌زمینه */}
        <svg className="absolute inset-0 h-full w-full p-8 opacity-15 pointer-events-none" viewBox="0 0 109 109">
          {currentData.paths.map((path, i) => (
            <path
              key={`${currentKanaKey}-${i}`}
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="draw-animation text-gray-500"
              style={{
                strokeDasharray: 300,
                strokeDashoffset: 300,
                animation: `drawPath 2s ease-out forwards`,
                animationDelay: `${i * 1.5}s`
              }}
            />
          ))}
        </svg>

        {/* بوم تعاملی کاربر */}
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="absolute inset-0 h-full w-full touch-none cursor-crosshair z-10"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* 3. لایه امتیازدهی (Modal) */}
        {score !== null && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md text-white animate-in fade-in zoom-in duration-300">
            <Sparkles className={clsx("w-12 h-12 mb-2", score >= 90 ? "text-yellow-400" : "text-gray-400")} />
            <span className="text-6xl font-black tracking-tighter">
              {score}<span className="text-3xl">%</span>
            </span>
            <span className="text-lg mt-2 font-medium">
              {score >= 90
                ? 'Awesome work! 🌟'
                : score >= 60
                  ? 'Nice job, keep practicing! 👍'
                  : 'Keep trying, you\'ll get it! 💪'}
            </span>
            <button
              onClick={clearCanvas}
              className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
              Practice Again
            </button>
          </div>
        )}
      </div>

      {/* 4. Controls (دکمه‌های انتخاب و اکشن‌ها) */}
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">

        {/* دکمه بررسی نتیجه */}
        <button
          onClick={checkScore}
          disabled={drawnStrokesCount === 0 || score !== null}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-(--main-color) text-white font-bold text-lg shadow-md hover:brightness-110 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Check className="w-6 h-6" />
          Check result
        </button>

        {/* انتخاب حروف */}
        <div className="flex gap-4">
          {Object.keys(strokeDatabase).map((k) => (
            <button
              key={k}
              onClick={() => changeKana(k)}
              className={clsx(
                'h-14 w-14 rounded-xl border-2 text-2xl font-bold transition-all shadow-sm',
                currentKanaKey === k
                  ? 'border-(--main-color) bg-(--main-color) text-white scale-110'
                  : 'border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:bg-(--main-color)/10'
              )}
            >
              {k}
            </button>
          ))}
        </div>

        {/* پاک کردن بوم */}
        <button
          onClick={clearCanvas}
          className="text-sm text-(--secondary-color) hover:text-(--main-color) flex items-center gap-1"
        >
          <RotateCcw className="w-4 h-4" />
          Clear screen
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default StrokeTrainer;