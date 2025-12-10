import PostWrapper from '@/shared/components/PostWrapper';
import securityPolicy from '@/shared/lib/legal/securityPolicy';
import ContentLayout from '@/shared/components/ContentLayout';

const SecurityPolicy = () => {
  return (
    <ContentLayout>
      <PostWrapper textContent={securityPolicy} />
    </ContentLayout>
  );
};

export default SecurityPolicy;
