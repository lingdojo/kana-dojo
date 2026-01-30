import { redirect } from 'next/navigation';

export default async function LearnHiraganaAliasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/kana/learn-hiragana`);
}
