import { redirect } from 'next/navigation';

export default async function LearnKatakanaAliasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/kana/learn-katakana`);
}
