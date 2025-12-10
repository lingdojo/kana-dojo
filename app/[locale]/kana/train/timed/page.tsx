import TimedChallengeKana from '@/features/Kana/components/TimedChallenge';

export default function TimedKanaPage() {
  return (
    <main className='p-4 max-w-xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4 text-center'>
        Timed Challenge: Kana
      </h1>
      <TimedChallengeKana />
    </main>
  );
}
