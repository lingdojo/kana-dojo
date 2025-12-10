import { Metadata } from 'next';
import AchievementProgress from '@/features/Achievements/components/AchievementProgress';
import Sidebar from '@/shared/components/Menu/Sidebar';

export const metadata: Metadata = {
  title: 'Achievements - Track Your Japanese Learning Progress',
  description:
    'Track your Japanese learning progress and unlock achievements in KanaDojo. Monitor your mastery of Hiragana, Katakana, Kanji, and Vocabulary with detailed statistics and milestones.',
  openGraph: {
    title: 'Achievements - Track Your Japanese Learning Progress',
    description:
      'Monitor your Japanese learning journey with detailed achievements and progress tracking.',
    url: 'https://kanadojo.com/achievements',
    type: 'website'
  },
  alternates: {
    canonical: 'https://kanadojo.com/achievements'
  }
};

export default function AchievementsPage() {
  return (
    <div className='min-h-[100dvh] max-w-[100dvw] flex'>
      <Sidebar />
      <div className='flex flex-col gap-4 w-full lg:w-4/5 px-4 md:px-8 pb-20'>
        <AchievementProgress />
      </div>
    </div>
  );
}
