"use client"
import React from 'react'
import Image from 'next/image'

type Sponsor = { login: string; avatar: string; url: string }

export default function SponsorsGrid({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {sponsors.map((s) => (
        <a
          key={s.login}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center text-center p-2 rounded hover:bg-slate-700/20"
        >
          <Image src={s.avatar} alt={s.login} width={64} height={64} className="rounded-full mb-2" unoptimized />
          <span className="text-sm truncate max-w-full">{s.login}</span>
        </a>
      ))}
    </div>
  )
}
