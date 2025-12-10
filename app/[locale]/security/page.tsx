import SecurityPolicy from '@/features/Legal/Security';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Policy - How We Keep KanaDojo Safe',
  description:
    "Learn about KanaDojo's security measures and policies to protect your learning experience and data.",
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://kanadojo.com/security'
  }
};

export default function SecurityPolicyPage() {
  return <SecurityPolicy />;
}
