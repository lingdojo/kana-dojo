import LegalLayout from '@/shared/ui-composite/layout/LegalLayout';
import PostWrapper from '@/shared/ui-composite/layout/PostWrapper';
import termsOfService from '@/shared/utils/legal/termsOfService';
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

