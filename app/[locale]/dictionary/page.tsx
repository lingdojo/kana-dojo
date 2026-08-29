import { DictionarySearch } from '@/features/SearchEngine/components/DictionarySearch';

export const metadata = {
  title: 'Dictionary Search | KanaDojo',
  description: 'Search across thousands of Kanji and Vocabulary words.',
};

export default function DictionaryPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-background">
      <DictionarySearch />
    </div>
  );
}
