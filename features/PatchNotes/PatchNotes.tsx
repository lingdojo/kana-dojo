import LegalLayout from '@/shared/components/layout/LegalLayout';
import PostWrapper from '@/shared/components/layout/PostWrapper';
import patchNotesData from './patchNotesData.json';
import { FileDiff } from 'lucide-react';

const PatchNotes = () => {
  return (
    <LegalLayout
      icon={<FileDiff className='size-6' />}
      title='Patch Notes'
      lastUpdated='April 8, 2026'
    >
      <div className='space-y-8'>
        {patchNotesData.map((patch, index) => (
          <div key={index}>
            <PostWrapper
              textContent={patch.changes
                .map(change => `- ${change}`)
                .join('\n')}
              tag={`v${patch.version}`}
              date={new Date(patch.date).toISOString()}
            />
            {index < patchNotesData.length - 1 && (
              <hr className='mt-8 border-(--border-color) opacity-50' />
            )}
          </div>
        ))}
      </div>
    </LegalLayout>
  );
};

export default PatchNotes;
