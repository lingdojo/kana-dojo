import PostWrapper from '@/shared/components/layout/PostWrapper';
import ContentLayout from '@/shared/components/layout/ContentLayout';
import ContributorsGrid from '@/features/Legal/credits/ContributorsGrid';
import SponsorsGrid from '@/features/Legal/credits/SponsorsGrid';
import { KO_FI_SUPPORTERS } from '@/features/Legal/credits/sponsorsData';
import type { Contributor } from './types';
import { Handshake, Heart } from 'lucide-react';
import { ORGANIZATION } from '@/features/Legal/credits/organizationData';

type GHContributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
};

const fetchContributors = async (): Promise<Contributor[]> => {
  try {
    const res = await fetch(
      'https://api.github.com/repos/lingdojo/kana-dojo/contributors?per_page=100',
      { next: { revalidate: 60 * 60 * 24 } }
    );

    if (!res.ok) return [];

    const data: GHContributor[] = await res.json();
    return data
      .filter(c => c.type !== 'Bot')
      .map(c => ({
        login: c.login,
        avatar: c.avatar_url,
        url: c.html_url
      }));
  } catch (e) {
    console.error('Failed to fetch contributors', e);
    return [];
  }
};

export default async function Credits() {
  const contributors = await fetchContributors();
  const contributorsList = contributors.filter(
    c =>
      c.login !== ORGANIZATION.owner.login &&
      !ORGANIZATION.members.some(m => m.login === c.login)
  );

  const credits = `# Credits

  Thank you to everyone who has contributed to **KanaDojo** — maintainers, contributors, translators, and supporters.

  KanaDojo is what you see today thanks to everyone's work and suggestions. We'll keep making it **better**, and we hope you stay with us on this amazing adventure!
  `;

  return (
    <ContentLayout>
      <PostWrapper textContent={credits} />

      <section>
        <h2 className='mt-4 pb-2 text-2xl font-semibold'>Owner</h2>
        <ContributorsGrid contributors={[ORGANIZATION.owner]} />
      </section>

      <section>
        <h2 className='mt-4 pb-2 text-2xl font-semibold'>
          Organization Members
        </h2>
        <ContributorsGrid contributors={ORGANIZATION.members} />
      </section>

      {contributorsList.length > 0 && (
        <section>
          <h2 className='mt-4 pb-2 text-2xl font-semibold'>Contributors</h2>
          <ContributorsGrid contributors={contributorsList} />

          <div className='mt-8 rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-6'>
            <p className='mb-2 flex items-center gap-2 font-medium text-[var(--main-color)]'>
              <Handshake className='text-[var(--main-color)]' />
              Want to contribute?
            </p>
            <p className='text-sm text-[var(--secondary-color)]'>
              Visit our{' '}
              <a
                className='font-semibold text-[var(--main-color)] underline transition-opacity hover:opacity-70'
                href='https://github.com/lingdojo/kana-dojo'
                target='_blank'
                rel='noreferrer'
              >
                GitHub repository
              </a>{' '}
              to get started. All contributions are welcome!
            </p>
          </div>
        </section>
      )}

      {KO_FI_SUPPORTERS.length > 0 && (
        <section>
          <h2 className='mt-4 pb-2 text-2xl font-semibold'>Supporters</h2>
          <p className='my-1 leading-relaxed text-[var(--secondary-color)]'>
            A special thanks to our supporters!
          </p>
          <SponsorsGrid sponsors={KO_FI_SUPPORTERS} />
          <div className='mt-8 rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-6'>
            <p className='mb-3 flex items-center gap-2 font-medium text-[var(--main-color)]'>
              <Heart className='fill-current text-red-500 hover:text-red-500 motion-safe:animate-pulse' />
              Support KanaDojo
            </p>
            <p className='mb-4 text-sm text-[var(--secondary-color)]'>
              Your support is really appreciated. Thank you!
            </p>
            <div className='flex flex-wrap gap-3'>
              <a
                className='inline-flex items-center rounded-lg bg-[var(--main-color)] px-4 py-2 text-sm font-medium text-[var(--background-color)] transition-opacity hover:opacity-90'
                href='https://ko-fi.com/kanadojo'
                target='_blank'
                rel='noreferrer'
              >
                Ko-fi
              </a>
              <a
                className='inline-flex items-center rounded-lg border-2 border-[var(--main-color)] px-4 py-2 text-sm font-medium text-[var(--main-color)] transition-colors hover:bg-[var(--card-color)]'
                href='https://www.patreon.com/cw/kanadojo'
                target='_blank'
                rel='noreferrer'
              >
                Patreon
              </a>
            </div>
          </div>
        </section>
      )}
    </ContentLayout>
  );
}
