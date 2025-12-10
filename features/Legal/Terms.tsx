import ContentLayout from '@/shared/components/ContentLayout';
import PostWrapper from '@/shared/components/PostWrapper';
import termsOfService from '@/shared/lib/legal/termsOfService';

const TermsOfService = () => {
  return (
    <ContentLayout>
      <PostWrapper textContent={termsOfService} />
    </ContentLayout>
  );
};

export default TermsOfService;
