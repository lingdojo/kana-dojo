import React from 'react'
import PostWrapper from '@/shared/components/PostWrapper';
import BackButton from '@/shared/components/BackButton';
import ContributorsGrid from '@/features/Legal/credits/ContributorsGrid'
import SponsorsGrid from '@/features/Legal/credits/SponsorsGrid'
import { KO_FI_SUPPORTERS } from '@/features/Legal/credits/sponsorsData'
import type { Contributor, Sponsor } from './types'

type GHContributor = { login: string; avatar_url: string; html_url: string }

async function fetchContributors(): Promise<Contributor[]> {
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
    const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN
    if (token) headers['Authorization'] = `token ${token}`

    const res = await fetch('https://api.github.com/repos/lingdojo/kana-dojo/contributors?per_page=100', {
      headers,
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!res.ok) return []
    const data: GHContributor[] = await res.json()
    return Array.isArray(data)
      ? data.map((c) => ({ login: c.login, avatar: c.avatar_url, url: c.html_url }))
      : []
  } catch (e) {
    console.error('Failed to fetch contributors', e)
    return []
  }
}

async function fetchSponsors(): Promise<Sponsor[]> {
  const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN
  if (!token) return []

  const query = `
    query($login: String!) {
      user(login: $login) {
        sponsorshipsAsMaintainer(first: 100) {
          nodes {
            sponsorEntity {
              __typename
              ... on User { login avatarUrl url }
              ... on Organization { login avatarUrl url }
            }
          }
        }
      }
    }
  `

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `bearer ${token}` },
      body: JSON.stringify({ query, variables: { login: 'lingdojo' } }),
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!res.ok) return []
    const json = await res.json()
    const nodes = json?.data?.user?.sponsorshipsAsMaintainer?.nodes ?? []
    const sponsors: Sponsor[] = []
    for (const n of nodes) {
      const e = n?.sponsorEntity
      if (e && e.login) sponsors.push({ login: e.login, avatar: e.avatarUrl, url: e.url })
    }
    return sponsors
  } catch (e) {
    console.error('Failed to fetch sponsors', e)
    return []
  }
}
export default async function Credits() {
  const contributors = await fetchContributors()
  const sponsors = await fetchSponsors()

  const maintainers = contributors.slice(0, 2)
  const contributorsList = contributors.slice(2)

  // Combine GitHub sponsors with Ko‑fi supporters.
  // Always include Ko‑fi supporters alongside GitHub sponsors, and de-duplicate
  // by login (case-insensitive) so the same supporter won't appear twice.
  const sponsorsToShow: Sponsor[] = (() => {
    const merged = [...sponsors, ...KO_FI_SUPPORTERS]
    const seen = new Map<string, Sponsor>()
    for (const s of merged) {
      const key = (s.login || '').toLowerCase()
      if (!seen.has(key)) seen.set(key, s)
    }
    return Array.from(seen.values())
  })()

  const credits = `# Credits

**Thank you to everyone** who has contributed to **KanaDojo** — **maintainers**, **contributors**, **translators** and **supporters**. If you would like your name displayed on this page, please open a PR or contact the maintainers.
`
  return (
    <div>
      <div className="mx-auto max-w-4xl px-4 py-4 flex justify-center">
        <BackButton />
      </div>
      <div className="mx-auto max-w-4xl px-9 py-4">
        <PostWrapper textContent={credits} minHeight={false} />
      </div>

      {maintainers.length > 0 && (
        <section className="mx-auto max-w-4xl px-9 py-4"> 
          <h2 className="text-2xl font-semibold mb-4 text-black">Maintainers</h2>
          <ContributorsGrid contributors={maintainers} />
        </section>
      )}

      {contributorsList.length > 0 && (
        <section className="mx-auto max-w-4xl px-9 py-4">
          <h2 className="text-2xl font-semibold mb-4 text-black">Contributors</h2>
          <ContributorsGrid contributors={contributorsList} />
          <div className="mt-4 prose prose-invert text-[var(--secondary-color)]">
            <p>
              The full contributors list is available on GitHub:{' '}
              <a className="underline font-semibold" href="https://github.com/lingdojo/kana-dojo/graphs/contributors" target="_blank" rel="noreferrer">
                Contributors on GitHub
              </a>
            </p>
            <p>
              If you&apos;d like to contribute to the project, visit the repository:{' '}
              <a className="underline font-semibold text-[var(--secondary-color)]" href="https://github.com/lingdojo/kana-dojo" target="_blank" rel="noreferrer">
                KanaDojo
              </a>
            </p>
          </div>
        </section>
      )}

      {sponsorsToShow.length > 0 ? (
        <section className="mx-auto max-w-4xl px-9 py-4">
          <h2 className="text-2xl font-semibold mb-4 text-black">Sponsors & Donations</h2>
          <SponsorsGrid sponsors={sponsorsToShow} />
          <div className="mb-4 mt-4 prose prose-invert text-[var(--secondary-color)]"> 
            <p>
              If you would like to support the project financially you can use:{' '}
            </p>
            <ul className="list-disc list-inside ml-6 font-semibold">
              <li>
                <a className="underline" href="https://ko-fi.com/kanadojo" target="_blank" rel="noreferrer">Ko‑fi</a>
              </li>
              <li>
                <a className="underline" href="https://github.com/sponsors/lingdojo" target="_blank" rel="noreferrer">GitHub Sponsors</a>
              </li>
            </ul>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-4xl px-9 py-4 mb-8 prose prose-invert">
            <p>
            You can support the project via <a className="underline font-semibold" href="https://ko-fi.com/kanadojo">Ko‑fi</a> or{' '}
            <a className="underline font-semibold" href="https://github.com/sponsors/lingdojo">GitHub Sponsors</a>.
          </p>
        </section>
      )}      
    </div>
  )
}