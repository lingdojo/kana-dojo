import PostWrapper from '@/shared/components/PostWrapper';
import privacyPolicy from '@/shared/lib/legal/privacyPolicy';
import ContentLayout from '@/shared/components/ContentLayout';

const PrivacyPolicy = () => {
  return (
    <ContentLayout>
      <PostWrapper textContent={privacyPolicy} />
    </ContentLayout>
  );
};

export default PrivacyPolicy;
