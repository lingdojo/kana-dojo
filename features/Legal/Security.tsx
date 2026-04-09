import PostWrapper from '@/shared/components/layout/PostWrapper';
import securityPolicy from '@/shared/lib/legal/securityPolicy';
import LegalLayout from '@/shared/components/layout/LegalLayout';
import { FileLock2 } from 'lucide-react';

const SecurityPolicy = () => {
  return (
    <LegalLayout
      icon={<FileLock2 className='size-6' />}
      title='Security Policy'
      lastUpdated='April 8, 2026'
    >
      <PostWrapper textContent={securityPolicy} />
    </LegalLayout>
  );
};

export default SecurityPolicy;
