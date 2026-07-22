'use client';

import BackButton from '../navigation/BackButton';
import Banner from '../Menu/Banner';

const ContentLayout = ({ children }: { children: React.ReactNode }) => (
  <div className='min-h-[100dvh] max-w-[100dvw] px-4 pb-10 sm:px-8 md:px-20 xl:px-66'>
    <Banner />
    <BackButton />
    {children}
  </div>
);

export default ContentLayout;
