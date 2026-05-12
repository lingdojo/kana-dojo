import PostWrapper from '@/shared/ui-composite/layout/PostWrapper';
import privacyPolicy from '@/shared/utils/legal/privacyPolicy';
import LegalLayout from '@/shared/ui-composite/layout/LegalLayout';
import { Cookie } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <LegalLayout
      icon={<Cookie className='size-6' />}
      title='Privacy Policy'
      lastUpdated='April 8, 2026'
    >
      <PostWrapper textContent={privacyPolicy} />
    </LegalLayout>
  );
};

export default PrivacyPolicy;

