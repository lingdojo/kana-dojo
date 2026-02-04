'use client';

import { RunnerGame } from '@/features/Experiments/components/RunnerGame';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/core/i18n/routing';

export default function RunnerPage() {
  return (
    <div className='mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-6'>
      {/* Header */}
      <header className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' asChild className='rounded-xl'>
          <Link href='/experiments'>
            <ArrowLeft className='h-6 w-6' />
          </Link>
        </Button>
        <div>
          <h1 className='text-3xl font-bold text-(--main-color)'>
            Yokai Run
          </h1>
          <p className='text-(--secondary-color)'>
            Avoid the obstacles and run as far as you can!
          </p>
        </div>
      </header>

      {/* Game Area */}
      <main className='flex min-h-[500px] flex-1 items-center justify-center'>
        <RunnerGame />
      </main>
    </div>
  );
}
