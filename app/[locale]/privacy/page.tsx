import PrivacyPolicy from '@/features/Legal/Privacy';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Your Data Protection at KanaDojo',
  description:
    "Read KanaDojo's privacy policy to understand how we collect, use, and protect your personal information while you learn Japanese.",
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://kanadojo.com/privacy'
  }
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
