import LegalLayout from '@/shared/components/layout/LegalLayout';
import PostWrapper from '@/shared/components/layout/PostWrapper';
import termsOfService from '@/shared/lib/legal/termsOfService';
import { ScrollText } from 'lucide-react';

const TermsOfService = () => {
  return (
    <LegalLayout
      icon={<ScrollText className='size-6' />}
      title='Terms of Service'
      lastUpdated='April 8, 2026'
    >
      <PostWrapper textContent={termsOfService} />
    </LegalLayout>
  );
};

export default TermsOfService;
