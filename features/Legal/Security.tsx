import PostWrapper from '@/shared/components/layout/PostWrapper';
import securityPolicy from '@/shared/lib/legal/securityPolicy';
import LegalLayout from '@/shared/components/layout/LegalLayout';

const SecurityPolicy = () => {
  return (
    <LegalLayout>
      <PostWrapper textContent={securityPolicy} />
    </LegalLayout>
  );
};

export default SecurityPolicy;
