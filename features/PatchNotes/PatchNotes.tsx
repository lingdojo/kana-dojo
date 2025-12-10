import ContentLayout from '@/shared/components/ContentLayout';
import PostWrapper from '@/shared/components/PostWrapper';
import { patchNotesData } from './patchNotesData';

export interface Release {
  id: number;
  tag_name: string;
  published_at: string;
  body: string;
}

const PatchNotes = async () => {
  let patches: Release[] = [];

  try {
    const response = await fetch(
      'https://api.github.com/repos/lingdojo/kana-dojo/releases?per_page=5',
      { next: { revalidate: 3600 } }
    );
    if (response.ok) {
      patches = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch releases from GitHub:', error);
  }

  // If no GitHub releases, use local patch notes data
  if (!patches || patches.length === 0) {
    return (
      <ContentLayout>
        <div className='space-y-6'>
          {patchNotesData.map((patch, index) => (
            <PostWrapper
              key={index}
              textContent={patch.changes
                .map(change => `- ${change}`)
                .join('\n')}
              tag={`v${patch.version}`}
              date={new Date(patch.date).toISOString()}
            />
          ))}
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      {patches.map(release => (
        <PostWrapper
          key={release.id}
          textContent={release.body}
          tag={release.tag_name}
          date={release.published_at}
        />
      ))}
    </ContentLayout>
  );
};

export default PatchNotes;
