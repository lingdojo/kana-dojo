import { getTranslations } from 'next-intl/server';
import KanaChartDisplay from './KanaChartDisplay';
import { routing } from '@/core/i18n/routing';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'Hiragana & Katakana Chart - Complete Kana Reference | KanaDojo',
    description:
      'Complete Hiragana and Katakana chart with all characters, romanization, and pronunciation guide. Free interactive Japanese kana reference table for learners.',
    keywords:
      'hiragana chart, katakana chart, kana chart, japanese alphabet chart, hiragana table, katakana table, japanese characters, kana reference, hiragana katakana chart, learn kana',
  };
}

export default async function KanaChartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('kanaChart');

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://kanadojo.com/${locale}` },
          { name: 'Tools', url: `https://kanadojo.com/${locale}/tools` },
          {
            name: 'Kana Chart',
            url: `https://kanadojo.com/${locale}/tools/kana-chart`,
          },
        ]}
      />
      <div className='mx-auto max-w-7xl px-4 py-8'>
        <h1 className='mb-4 text-center text-4xl font-bold text-(--main-color)'>
          {t('title')}
        </h1>
        <p className='mb-8 text-center text-lg text-(--secondary-color)'>
          {t('subtitle')}
        </p>

        <KanaChartDisplay />

        <div className='mt-12 space-y-6 text-(--secondary-color)'>
          <section>
            <h2 className='mb-3 text-2xl font-semibold text-(--main-color)'>
              {t('aboutTitle')}
            </h2>
            <p className='mb-4'>{t('aboutText')}</p>
          </section>

          <section>
            <h2 className='mb-3 text-2xl font-semibold text-(--main-color)'>
              {t('howToUseTitle')}
            </h2>
            <ul className='list-disc space-y-2 pl-6'>
              <li>{t('howToUse1')}</li>
              <li>{t('howToUse2')}</li>
              <li>{t('howToUse3')}</li>
              <li>{t('howToUse4')}</li>
            </ul>
          </section>

          <section>
            <h2 className='mb-3 text-2xl font-semibold text-(--main-color)'>
              {t('practiceTitle')}
            </h2>
            <p>{t('practiceText')}</p>
          </section>
        </div>
      </div>
    </>
  );
}
