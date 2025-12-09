"use client"
import React from 'react'
import Image from 'next/image'
import type { Sponsor } from './types'

export default function SponsorsGrid({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {sponsors.map((s) => {
        const Content = (
          <div className="flex flex-col items-center text-center p-2 rounded text-[var(--secondary-color)]">
            <Image src={s.avatar} alt={s.login} width={48} height={48} className="rounded-full mb-2" unoptimized />
            <span className="text-sm truncate max-w-full">{s.login}</span>
          </div>
        )

        // If sponsor has a URL, render as link; otherwise render a static block
        return s.url ? (
          <a key={s.login} href={s.url} target="_blank" rel="noreferrer" className="hover:bg-slate-700/20 text-[var(--secondary-color)]">
            {Content}
          </a>
        ) : (
          <div key={s.login}>{Content}</div>
        )
      })}
    </div>
  )
}
