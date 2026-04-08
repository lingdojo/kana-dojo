'use client';

import BackButton from '../navigation/BackButton';
import Banner from '../Menu/Banner';

const LegalLayout = ({ children }: { children: React.ReactNode }) => (
  <div className='min-h-dvh bg-(--background-color)'>
    <div className='mx-auto max-w-[900px] px-8 pb-20 md:px-16 lg:px-20'>
      <Banner />
      <BackButton />
      <article>{children}</article>
    </div>
  </div>
);

export default LegalLayout;
