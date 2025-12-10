export interface PatchNote {
  version: string;
  date: string;
  changes: string[];
}

export const patchNotesData: PatchNote[] = [
  {
    version: '0.1.9',
    date: 'December 5, 2025',
    changes: [
      'Smart Learning System: The app now remembers which characters you struggle with and shows them more often',
      'Your accuracy on each character is saved and used to personalize your training',
      'Click vocabulary words to open their Jisho dictionary entries in a new tab',
      'Added quick Hanabira link in the desktop bottom bar',
      'Improved progress tracking with GitHub-style calendar grid',
      'BackToTop button now stays in the top-right corner on all devices',
      'Security Update: Fixed critical Next.js vulnerability'
    ]
  },
  {
    version: '0.1.8',
    date: 'December 4, 2025',
    changes: [
      'Smarter Vocabulary Quizzes: Words with Kanji now test both reading and meaning',
      'Kana-only words now strictly focus on meaning quizzes',
      'Fixed level sorting in Collection Selector (numerical order)',
      'Improved theme color generation system'
    ]
  },
  {
    version: '0.1.7',
    date: 'December 3, 2025',
    changes: [
      'Refactored TopBar to BottomBar for better mobile experience',
      'Added aesthetic gradient background to progress bars',
      'Improved Character Selection Menu UI',
      'Added currently selected font name to BottomBar',
      'Fixed Kana spacing and centered decorations',
      'Mobile improvements: BackToTop position and Start Training button'
    ]
  },
  {
    version: '0.1.6',
    date: 'November 30, 2025',
    changes: [
      'Added streak counter to all game modes (Kana, Vocabulary, and Kanji)',
      'Streak counter now displays in real-time during gameplay',
      'Track your best streak across all game modes',
      'Improved stats tracking and display in game results'
    ]
  }
];
