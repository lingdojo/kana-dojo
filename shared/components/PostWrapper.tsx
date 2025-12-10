'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PostWrapper = ({
  textContent,
  tag,
  date,
  minHeight,
}: {
  textContent: string;
  tag?: string;
  date?: string;
  minHeight?: boolean;
}) => {
  return (
    <div className={minHeight === false ? undefined : 'min-h-[24rem]'}>
      {tag && date && (
        <div className="my-2 flex justify-between items-center w-full">
          <h1 className="text-3xl font-bold mt-4 pb-3">{tag}</h1>
          <span className="my-1 leading-relaxed text-[var(--main-color)]">
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
          a: (props) => (
            <a
              target="_blank"
              className="underline text-[var(--main-color)]"
              {...props}
            />
          ),

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
