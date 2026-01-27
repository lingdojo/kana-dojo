import { ChevronDown } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

export interface FAQGroup {
  id: string;
  title: string;
  description?: string;
  faqs: FAQ[];
}

interface FAQSectionProps {
  groups: FAQGroup[];
}

export default function FAQSection({ groups }: FAQSectionProps) {
  return (
    <div className='space-y-12'>
      {groups.map(group => (
        <section key={group.id} id={group.id} className='scroll-mt-28'>
          <header className='mb-5'>
            <h2 className='text-2xl font-semibold tracking-tight text-(--main-color) sm:text-3xl'>
              {group.title}
            </h2>
            {group.description && (
              <p className='mt-2 max-w-2xl text-sm leading-relaxed text-(--secondary-color) sm:text-base'>
                {group.description}
              </p>
            )}
          </header>

          <div className='space-y-3'>
            {group.faqs.map(faq => (
              <details
                key={faq.question}
                className='group overflow-hidden rounded-2xl border border-(--border-color) bg-[color-mix(in_oklab,var(--card-color),transparent_0%)] shadow-[0_1px_0_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.08)]'
              >
                <summary className='relative flex cursor-pointer list-none items-start gap-3 px-5 py-4 pr-12 text-left transition-colors outline-none hover:bg-[color-mix(in_oklab,var(--card-color),var(--main-color)_6%)] focus-visible:ring-2 focus-visible:ring-(--main-color) focus-visible:ring-offset-2 focus-visible:ring-offset-(--background-color) sm:px-6'>
                  <span className='mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full bg-(--main-color) shadow-[0_0_0_4px_color-mix(in_oklab,var(--main-color),transparent_82%)]' />
                  <span className='text-base leading-snug font-semibold text-(--main-color) sm:text-lg'>
                    {faq.question}
                  </span>
                  <ChevronDown className='absolute top-5 right-5 h-5 w-5 text-(--secondary-color) transition-transform group-open:rotate-180 sm:top-6 sm:right-6' />
                </summary>
                <div className='px-5 pr-5 pb-5 pl-9 text-sm leading-relaxed text-(--secondary-color) sm:px-6 sm:pb-6 sm:pl-11 sm:text-base'>
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
