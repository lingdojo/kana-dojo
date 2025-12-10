import TermsOfService from '@/features/Legal/Terms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - KanaDojo Usage Guidelines',
  description:
    "Review KanaDojo's terms of service to understand the rules and guidelines for using our Japanese learning platform.",
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://kanadojo.com/terms'
  }
};

export default function TermsOfServicePage() {
  return <TermsOfService />;
}
