'use client';
import React from 'react';
import Image from 'next/image';
import type { Sponsor } from './types';

export default function SponsorsGrid({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <div className='mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8'>
      {sponsors.map(s => {
        const Content = (
          <div className='flex flex-col items-center rounded p-2 text-center text-(--secondary-color) transition-colors hover:bg-(--card-color)'>
            <Image
              src={s.avatar}
              alt={`${s.login} - KanaDojo sponsor avatar`}
              unoptimized // don't remove this, I don't want to include the domain (api.dicebear.com) in  next.config.js
              width={48}
              height={48}
              className='mb-2 rounded-full'
              loading='lazy'
              sizes='48px'
            />
            <span className='max-w-full truncate text-sm'>{s.login}</span>
          </div>
        );

        // If sponsor has a URL, render as link; otherwise render a static block
        return s.url ? (
          <a
            key={s.login}
            href={s.url}
            target='_blank'
            rel='noreferrer'
            className='text-(--secondary-color) hover:bg-slate-700/20'
          >
            {Content}
          </a>
        ) : (
          <div key={s.login}>{Content}</div>
        );
      })}
    </div>
  );
}
