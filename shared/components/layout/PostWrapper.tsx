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
        <div className='my-2 flex w-full items-center justify-between'>
          <h1 className='mt-4 pb-3 text-3xl font-bold text-(--main-color)'>
            {tag}
          </h1>
          <span className='my-1 leading-relaxed text-(--secondary-color)'>
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
            <h1 className='mt-4 pb-3 text-3xl font-bold' {...props} />
          ),
          h2: props => (
            <h2 className='mt-4 pb-2 text-2xl font-semibold' {...props} />
          ),
          h3: props => (
            <h3 className='mt-4 pb-2 text-xl font-medium' {...props} />
          ),
          p: props => (
            <p
              className='my-1 leading-relaxed text-(--secondary-color)'
              {...props}
            />
          ),
          ul: props => (
            <ul
              className='list-inside list-disc pb-2 text-(--secondary-color)'
              {...props}
            />
          ),
          ol: props => (
            <ol
              className='list-inside list-decimal pb-4 text-(--secondary-color)'
              {...props}
            />
          ),
          li: props => <li className='mb-1' {...props} />,
          a: props => (
            <a
              target='_blank'
              className='text-(--main-color) underline'
              {...props}
            />
          ),

          table: props => (
            <table
              className='w-full border-collapse border border-(--border-color)'
              {...props}
            />
          ),
          th: props => (
            <th
              className='border border-(--border-color) px-2 py-1'
              {...props}
            />
          ),
          td: props => (
            <td
              className='border border-(--border-color) px-2 py-1'
              {...props}
            />
          ),
          hr: props => (
            <hr className='border-(--border-color)' {...props} />
          ),
        }}
      >
        {textContent}
      </ReactMarkdown>
    </div>
  );
};

export default PostWrapper;
