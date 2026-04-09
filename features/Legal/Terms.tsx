import LegalLayout from '@/shared/components/layout/LegalLayout';
import PostWrapper from '@/shared/components/layout/PostWrapper';
import termsOfService from '@/shared/lib/legal/termsOfService';

const TermsOfService = () => {
  return (
    <LegalLayout>
      <PostWrapper textContent={termsOfService} />
    </LegalLayout>
  );
};

export default TermsOfService;
