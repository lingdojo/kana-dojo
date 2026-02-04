'use client';
import { useState, useMemo } from 'react';
import { allKana } from '../data/kanaData';

/**
 * Kana Fortune - Spin the wheel for your daily kana fortune!
 */
const fortunes = [
  { text: 'Great luck today!', emoji: '🌟', color: 'text-yellow-400' },
  { text: 'Love is in the air', emoji: '💖', color: 'text-pink-400' },
  { text: 'Adventure awaits', emoji: '🗻', color: 'text-blue-400' },
  { text: 'Study hard today', emoji: '📚', color: 'text-purple-400' },
  { text: 'Small blessing', emoji: '🍀', color: 'text-green-400' },
  { text: 'Be patient', emoji: '🐢', color: 'text-teal-400' },
  { text: 'Take a rest', emoji: '😴', color: 'text-indigo-400' },
  { text: 'Make new friends', emoji: '🤝', color: 'text-orange-400' },
];

const KanaFortune = () => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{
    kana: (typeof allKana)[0];
    fortune: (typeof fortunes)[0];
  } | null>(null);

  const wheelKana = useMemo(
    () => allKana.slice(0, 8).map((k, i) => ({ ...k, angle: i * 45 })),
    [],
  );

  const spin = () => {
    if (spinning) return;

    setSpinning(true);
    setResult(null);

    const spins = 3 + Math.random() * 3; // 3-6 full rotations
    const extraAngle = Math.random() * 360;
    const newRotation = rotation + spins * 360 + extraAngle;

    setRotation(newRotation);

    setTimeout(() => {
      const finalAngle = newRotation % 360;
      const selectedIdx =
        Math.floor(((360 - finalAngle + 22.5) % 360) / 45) % 8;
      const selectedKana = wheelKana[selectedIdx];
      const selectedFortune =
        fortunes[Math.floor(Math.random() * fortunes.length)];

      setResult({ kana: selectedKana, fortune: selectedFortune });
      setSpinning(false);
    }, 4000);
  };

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-8 p-4'>
      <h2 className='text-2xl text-(--main-color)'>🔮 Kana Fortune</h2>

      {/* Wheel */}
      <div className='relative'>
        {/* Pointer */}
        <div className='absolute -top-4 left-1/2 z-10 -translate-x-1/2 text-3xl'>
          ▼
        </div>

        {/* Wheel */}
        <div
          className='relative h-64 w-64 rounded-full border-4 border-(--border-color) bg-(--card-color)'
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
              : 'none',
          }}
        >
          {wheelKana.map((k, i) => (
            <span
              key={i}
              lang='ja'
              className='absolute top-1/2 left-1/2 text-2xl text-(--main-color)'
              style={{
                transform: `rotate(${k.angle}deg) translateY(-90px) rotate(-${k.angle}deg)`,
                transformOrigin: '0 0',
              }}
            >
              {k.kana}
            </span>
          ))}

          {/* Wheel sections */}
          {wheelKana.map((_, i) => (
            <div
              key={i}
              className='absolute top-1/2 left-1/2 h-px w-32 origin-left bg-(--border-color)/50'
              style={{ transform: `rotate(${i * 45}deg)` }}
            />
          ))}
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={spinning}
        className={`rounded-xl px-8 py-4 text-xl text-white transition-all ${
          spinning
            ? 'cursor-not-allowed bg-gray-500'
            : 'bg-(--accent-color) hover:scale-105'
        }`}
      >
        {spinning ? '🌀 Spinning...' : '✨ Spin!'}
      </button>

      {/* Result */}
      {result && (
        <div className='animate-fade-in flex flex-col items-center gap-3'>
          <div className='text-6xl'>{result.fortune.emoji}</div>
          <div className='flex items-center gap-3'>
            <span lang='ja' className='text-4xl text-(--accent-color)'>
              {result.kana.kana}
            </span>
            <span className='text-xl text-(--secondary-color)'>
              ({result.kana.romanji})
            </span>
          </div>
          <p className={`text-xl ${result.fortune.color}`}>
            {result.fortune.text}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default KanaFortune;
