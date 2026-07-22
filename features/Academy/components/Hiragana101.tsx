'use client';

import type { FC } from 'react';
import PostWrapper from '@/shared/ui-composite/layout/PostWrapper';
import hiragana101 from '@/features/Academy/data/hiraganaBlogPost';

const Hiragana101: FC = () => <PostWrapper textContent={hiragana101} />;

export default Hiragana101;

