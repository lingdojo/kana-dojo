import Settings from '@/features/Preferences/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preferences - Customize Your Learning Experience',
  description:
    'Customize your KanaDojo learning experience with 100+ themes, 28 Japanese fonts, sound effects, and display options. Personalize your Japanese learning journey.',
  openGraph: {
    title: 'Preferences - Customize KanaDojo',
    description:
      'Customize your learning experience with themes, fonts, and display options.',
    url: 'https://kanadojo.com/preferences',
    type: 'website'
  },
  alternates: {
    canonical: 'https://kanadojo.com/preferences'
  }
};

export default function SettingsPage() {
  return <Settings />;
}
