'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PostWrapper = ({
  textContent,
  tag,
  date,
}: {
  textContent: string;
  tag?: string;
  date?: string;
}) => {
  return (
    <div>
      {tag && date && (
        <div className='mb-10 flex w-full items-center justify-between'>
          <h1 className='text-5xl font-bold text-(--main-color)'>{tag}</h1>
          <span className='text-xs text-(--secondary-color)'>
            {new Date(date).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      )}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: props => (
            <h1
              className='mt-0 mb-4 text-[2.5rem] leading-tight font-bold text-(--main-color)'
              {...props}
            />
          ),
          h2: props => (
            <h2
              className='mt-12 mb-6 border-b border-(--border-color) pb-3 text-[1.75rem] leading-snug font-semibold text-(--main-color)'
              {...props}
            />
          ),
          h3: props => (
            <h3
              className='mt-10 mb-4 border-b border-(--border-color) pb-3 text-[1.375rem] leading-snug font-semibold text-(--main-color)'
              {...props}
            />
          ),
          p: props => (
            <p
              className='mb-4 leading-relaxed text-(--secondary-color)'
              {...props}
            />
          ),
          ul: props => (
            <ul
              className='mb-5 ml-5 list-outside list-disc space-y-2 text-(--secondary-color)'
              {...props}
            />
          ),
          ol: props => (
            <ol
              className='mb-5 ml-5 list-outside list-decimal space-y-2 text-(--secondary-color)'
              {...props}
            />
          ),
          li: props => <li className='pl-1 leading-relaxed' {...props} />,
          a: props => (
            <a
              target='_blank'
              rel='noopener noreferrer'
              className='text-(--main-color) underline hover:text-(--secondary-color)'
              {...props}
            />
          ),
          strong: props => (
            <strong className='font-semibold text-(--main-color)' {...props} />
          ),
          em: props => (
            <em className='text-(--secondary-color) italic' {...props} />
          ),
          blockquote: props => (
            <blockquote
              className='my-6 border-l-4 border-(--border-color) pl-4 text-(--secondary-color) italic'
              {...props}
            />
          ),
          hr: props => (
            <hr className='my-8 border-(--border-color)' {...props} />
          ),
          table: props => (
            <div className='my-6 overflow-x-auto'>
              <table className='w-full border-collapse' {...props} />
            </div>
          ),
          thead: props => <thead className='bg-(--card-color)' {...props} />,
          th: props => (
            <th
              className='border border-(--border-color) px-3 py-2 text-left font-semibold'
              {...props}
            />
          ),
          td: props => (
            <td
              className='border border-(--border-color) px-3 py-2'
              {...props}
            />
          ),
          code: props => (
            <code
              className='rounded bg-(--card-color) px-1.5 py-0.5 font-mono text-sm text-(--main-color)'
              {...props}
            />
          ),
          pre: props => (
            <pre
              className='my-6 overflow-x-auto rounded-lg bg-(--card-color) p-4'
              {...props}
            />
          ),
        }}
      >
        {textContent}
      </ReactMarkdown>
    </div>
  );
};

export default PostWrapper;
