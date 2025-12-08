'use client';

import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Banner from './Menu/Banner';
import { buttonBorderStyles } from '@/static/styles';
import { ChevronsLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useClick } from '@/hooks/useAudio';

const PostWrapper = ({ textContent, minHeight = true }: { textContent: string; minHeight?: boolean }) => {
  const { playClick } = useClick();

  return (
    <div className={`${minHeight ? 'min-h-[100dvh]' : ''} max-w-[100dvw] px-4 pb-10 sm:px-8 md:px-20 xl:px-66`}>
      <Banner />
      <Link href="/" className="w-full md:w-1/3 lg:w-1/4">
        <button
          onClick={() => playClick()}
          className={clsx(
            buttonBorderStyles,
            'py-4 px-16',
            'w-full',
            'flex items-center justify-center'
          )}
        >
          <ChevronsLeft />
        </button>
      </Link>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="text-3xl font-bold mt-4 pb-3" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-2xl font-semibold mt-4 pb-2" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-xl font-medium mt-4 pb-2" {...props} />
          ),
          p: (props) => (
            <p
              className="my-1  leading-relaxed text-[var(--secondary-color)]"
              {...props}
            />
          ),
          ul: (props) => (
            <ul
              className="list-disc list-inside pb-2 text-[var(--secondary-color)]"
              {...props}
            />
          ),
          ol: (props) => (
            <ol
              className="list-decimal list-inside pb-4 text-[var(--secondary-color)]"
              {...props}
            />
          ),
          li: (props) => <li className="mb-1" {...props} />,
          a: (props) => <a className="underline" {...props} />,

          table: (props) => (
            <table
              className="border-collapse border border-[var(--border-color)] w-full"
              {...props}
            />
          ),
          th: (props) => (
            <th
              className="border border-[var(--border-color)] px-2 py-1"
              {...props}
            />
          ),
          td: (props) => (
            <td
              className="border border-[var(--border-color)] px-2 py-1"
              {...props}
            />
          ),
          hr: (props) => (
            <hr className="border-[var(--border-color)]" {...props} />
          ),
        }}
      >
        {textContent}
      </ReactMarkdown>
    </div>
  );
};

export default PostWrapper;
