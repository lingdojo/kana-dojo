import PatchNotes from '@/features/PatchNotes/PatchNotes';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patch Notes - Latest Updates & Features',
  description:
    "Stay updated with the latest features, improvements, and bug fixes in KanaDojo. See what's new in our Japanese learning platform.",
  alternates: {
    canonical: 'https://kanadojo.com/patch-notes'
  }
};

export default function PatchNotesPage() {
  return <PatchNotes />;
}
