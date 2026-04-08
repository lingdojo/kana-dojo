import PostWrapper from '@/shared/components/layout/PostWrapper';
import privacyPolicy from '@/shared/lib/legal/privacyPolicy';
import LegalLayout from '@/shared/components/layout/LegalLayout';

const PrivacyPolicy = () => {
  return (
    <LegalLayout>
      <PostWrapper textContent={privacyPolicy} />
    </LegalLayout>
  );
};

export default PrivacyPolicy;
