'use client';
import { Link } from '@/core/i18n/routing';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import { experiments } from '@/shared/data/experiments';

export default function ExperimentsPage() {
  const { playClick } = useClick();

  return (
    <div className='flex flex-col gap-4 pt-4 md:pt-8'>
      <div className='mb-4'>
        <h1 className='text-2xl text-[var(--main-color)] md:text-3xl'>
          Experiments
        </h1>
        <p className='mt-1 text-[var(--secondary-color)]'>
          Relaxation and experimental features
        </p>
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {experiments.map(exp => (
          <Link
            key={exp.name}
            href={exp.href}
            onClick={() => playClick()}
            className={clsx(
              'flex cursor-pointer flex-col gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] p-6 transition-all duration-250 hover:border-[var(--main-color)]'
            )}
          >
            {exp.charIcon ? (
              <span className={clsx('text-2xl', exp.color)}>
                {exp.charIcon}
              </span>
            ) : exp.icon ? (
              <exp.icon size={32} className={exp.color} />
            ) : null}
            <div>
              <h2 className='text-lg text-[var(--main-color)]'>{exp.name}</h2>
              <p className='text-sm text-[var(--secondary-color)]'>
                {exp.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
