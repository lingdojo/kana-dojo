'use client';
import React from 'react';
import Image from 'next/image';
import type { Contributor } from './types';

export default function ContributorsGrid({
  contributors,
}: {
  contributors: Contributor[];
}) {
  return (
    <div className='mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
      {contributors.map(c => (
        <a
          key={c.login}
          href={c.url}
          target='_blank'
          rel='noreferrer'
          className='flex flex-col items-center rounded p-2 text-center text-(--secondary-color) transition-colors hover:bg-(--card-color)'
        >
          <Image
            src={c.avatar}
            alt={`${c.login} - KanaDojo contributor avatar`}
            width={48}
            height={48}
            className='mb-2 rounded-full'
            loading='lazy'
            sizes='48px'
          />
          <span className='max-w-full truncate text-sm'>{c.login}</span>
        </a>
      ))}
    </div>
  );
}
