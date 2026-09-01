/**
 * Tests for Vocabulary Store
 * Tests vocabulary selection state management using Zustand
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import useVocabStore, { type IVocabObj } from './useVocabStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Vocabulary Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // Reset the store to initial state
    // Note: Zustand state updates are synchronous, no need for act()
    useVocabStore.getState().setSelectedGameModeVocab('Pick');
    useVocabStore.getState().setSelectedVocabObjs([]);
    useVocabStore.getState().setSelectedVocabCollection('n5');
    useVocabStore.getState().setSelectedVocabSets([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('has correct default values', () => {
      const state = useVocabStore.getState();
      
      expect(state.selectedGameModeVocab).toBe('Pick');
      expect(state.selectedVocabObjs).toEqual([]);
      expect(state.selectedVocabCollection).toBe('n5');
      expect(state.selectedVocabSets).toEqual([]);
      expect(state.collapsedRowsByUnit).toEqual({});
    });
  });

  describe('Game Mode Selection', () => {
    it('sets game mode', () => {
      useVocabStore.getState().setSelectedGameModeVocab('Input');
      expect(useVocabStore.getState().selectedGameModeVocab).toBe('Input');
    });

    it('updates game mode multiple times', () => {
      const modes = ['Pick', 'Input', 'Reverse-Pick', 'Reverse-Input'];
      
      modes.forEach(mode => {
        useVocabStore.getState().setSelectedGameModeVocab(mode);
        expect(useVocabStore.getState().selectedGameModeVocab).toBe(mode);
      });
    });
  });

  describe('Vocabulary Object Selection', () => {
    const vocabObj1: IVocabObj = {
      word: '食べる',
      reading: 'たべる',
      meanings: ['to eat'],
    };

    const vocabObj2: IVocabObj = {
      word: '飲む',
      reading: 'のむ',
      meanings: ['to drink'],
    };

    const vocabObj3: IVocabObj = {
      word: '行く',
      reading: 'いく',
      meanings: ['to go'],
    };

    it('sets vocabulary objects', () => {
      useVocabStore.getState().setSelectedVocabObjs([vocabObj1, vocabObj2]);
      
      const state = useVocabStore.getState();
      expect(state.selectedVocabObjs).toHaveLength(2);
      expect(state.selectedVocabObjs.map(v => v.word)).toContain('食べる');
      expect(state.selectedVocabObjs.map(v => v.word)).toContain('飲む');
    });

    it('deduplicates vocabulary objects by word', () => {
      const duplicate: IVocabObj = {
        word: '食べる',
        reading: 'たべる',
        meanings: ['to eat (duplicate)'],
      };
      
      useVocabStore.getState().setSelectedVocabObjs([vocabObj1, duplicate]);
      
      expect(useVocabStore.getState().selectedVocabObjs).toHaveLength(1);
    });

    it('adds a single vocabulary object', () => {
      useVocabStore.getState().addVocabObj(vocabObj1);
      
      const state = useVocabStore.getState();
      expect(state.selectedVocabObjs).toHaveLength(1);
      expect(state.selectedVocabObjs[0].word).toBe('食べる');
    });

    it('toggles vocabulary object when adding existing', () => {
      // Add first
      useVocabStore.getState().addVocabObj(vocabObj1);
      expect(useVocabStore.getState().selectedVocabObjs).toHaveLength(1);
      
      // Add again (toggle off)
      useVocabStore.getState().addVocabObj(vocabObj1);
      expect(useVocabStore.getState().selectedVocabObjs).toHaveLength(0);
    });

    it('adds multiple vocabulary objects', () => {
      useVocabStore.getState().addVocabObjs([vocabObj1, vocabObj2]);
      
      expect(useVocabStore.getState().selectedVocabObjs).toHaveLength(2);
    });

    it('toggles multiple vocabulary objects', () => {
      // Add vocab objects
      useVocabStore.getState().addVocabObjs([vocabObj1, vocabObj2]);
      expect(useVocabStore.getState().selectedVocabObjs).toHaveLength(2);
      
      // Toggle off one, keep one
      useVocabStore.getState().addVocabObjs([vocabObj1]);
      expect(useVocabStore.getState().selectedVocabObjs).toHaveLength(1);
      expect(useVocabStore.getState().selectedVocabObjs[0].word).toBe('飲む');
    });

    it('clears all vocabulary objects', () => {
      useVocabStore.getState().addVocabObjs([vocabObj1, vocabObj2, vocabObj3]);
      expect(useVocabStore.getState().selectedVocabObjs).toHaveLength(3);
      
      useVocabStore.getState().clearVocabObjs();
      expect(useVocabStore.getState().selectedVocabObjs).toHaveLength(0);
    });
  });

  describe('Vocabulary Collection Selection', () => {
    it('sets vocabulary collection', () => {
      useVocabStore.getState().setSelectedVocabCollection('n4');
      
      expect(useVocabStore.getState().selectedVocabCollection).toBe('n4');
    });

    it('supports different JLPT levels', () => {
      const levels = ['n5', 'n4', 'n3', 'n2', 'n1'];
      
      levels.forEach(level => {
        useVocabStore.getState().setSelectedVocabCollection(level);
        expect(useVocabStore.getState().selectedVocabCollection).toBe(level);
      });
    });
  });

  describe('Vocabulary Sets Selection', () => {
    it('sets vocabulary sets', () => {
      const sets = ['set1', 'set2', 'set3'];
      
      useVocabStore.getState().setSelectedVocabSets(sets);
      
      expect(useVocabStore.getState().selectedVocabSets).toEqual(sets);
    });

    it('clears vocabulary sets', () => {
      useVocabStore.getState().setSelectedVocabSets(['set1', 'set2']);
      expect(useVocabStore.getState().selectedVocabSets).toHaveLength(2);
      
      useVocabStore.getState().clearVocabSets();
      expect(useVocabStore.getState().selectedVocabSets).toHaveLength(0);
    });

    it('replaces previous sets on new selection', () => {
      useVocabStore.getState().setSelectedVocabSets(['old1', 'old2']);
      
      useVocabStore.getState().setSelectedVocabSets(['new1', 'new2', 'new3']);
      
      expect(useVocabStore.getState().selectedVocabSets).toEqual(['new1', 'new2', 'new3']);
    });
  });

  describe('Collapsed Rows State', () => {
    it('sets collapsed rows for a unit', () => {
      useVocabStore.getState().setCollapsedRowsForUnit('n5-unit1', [1, 3, 5]);
      
      expect(useVocabStore.getState().collapsedRowsByUnit['n5-unit1']).toEqual([1, 3, 5]);
    });

    it('maintains collapsed rows for multiple units', () => {
      useVocabStore.getState().setCollapsedRowsForUnit('n5-unit1', [1, 2]);
      useVocabStore.getState().setCollapsedRowsForUnit('n4-unit1', [3, 4]);
      
      const state = useVocabStore.getState();
      expect(state.collapsedRowsByUnit['n5-unit1']).toEqual([1, 2]);
      expect(state.collapsedRowsByUnit['n4-unit1']).toEqual([3, 4]);
    });

    it('overwrites collapsed rows for same unit', () => {
      useVocabStore.getState().setCollapsedRowsForUnit('n5-unit1', [1, 2]);
      
      useVocabStore.getState().setCollapsedRowsForUnit('n5-unit1', [5, 6, 7]);
      
      expect(useVocabStore.getState().collapsedRowsByUnit['n5-unit1']).toEqual([5, 6, 7]);
    });

    it('handles empty collapsed rows', () => {
      useVocabStore.getState().setCollapsedRowsForUnit('n5-unit1', []);
      
      expect(useVocabStore.getState().collapsedRowsByUnit['n5-unit1']).toEqual([]);
    });
  });

  describe('Persistence', () => {
    it('maintains state across store access', () => {
      useVocabStore.getState().setSelectedVocabCollection('n3');
      
      // State should be accessible immediately
      expect(useVocabStore.getState().selectedVocabCollection).toBe('n3');
    });
  });

  describe('Complex Scenarios', () => {
    const createVocabObj = (word: string): IVocabObj => ({
      word,
      reading: `reading-${word}`,
      meanings: [`meaning-${word}`],
    });

    it('handles rapid state changes', () => {
      // Rapid selections
      useVocabStore.getState().addVocabObj(createVocabObj('word1'));
      useVocabStore.getState().addVocabObj(createVocabObj('word2'));
      useVocabStore.getState().addVocabObj(createVocabObj('word3'));
      // Rapid deselections
      useVocabStore.getState().addVocabObj(createVocabObj('word1'));
      // Collection changes
      useVocabStore.getState().setSelectedVocabCollection('n2');
      // Set selections
      useVocabStore.getState().setSelectedVocabSets(['a', 'b']);
      
      const state = useVocabStore.getState();
      expect(state.selectedVocabObjs).toHaveLength(2);
      expect(state.selectedVocabCollection).toBe('n2');
      expect(state.selectedVocabSets).toEqual(['a', 'b']);
    });

    it('maintains data integrity with multiple operations', () => {
      const words = Array.from({ length: 10 }, (_, i) => createVocabObj(`word${i}`));
      
      // Add all
      useVocabStore.getState().addVocabObjs(words);
      expect(useVocabStore.getState().selectedVocabObjs).toHaveLength(10);
      
      // Remove half
      useVocabStore.getState().addVocabObjs(words.slice(0, 5));
      expect(useVocabStore.getState().selectedVocabObjs).toHaveLength(5);
      
      // Add back
      useVocabStore.getState().addVocabObjs(words.slice(0, 5));
      expect(useVocabStore.getState().selectedVocabObjs).toHaveLength(10);
    });

    it('handles vocabulary with same word but different readings', () => {
      const vocab1: IVocabObj = {
        word: '日',
        reading: 'ひ',
        meanings: ['day', 'sun'],
      };
      
      const vocab2: IVocabObj = {
        word: '日',
        reading: 'にち',
        meanings: ['day (counter)'],
      };
      
      useVocabStore.getState().addVocabObjs([vocab1, vocab2]);
      
      // Should deduplicate by word, keeping only one
      const state = useVocabStore.getState();
      expect(state.selectedVocabObjs).toHaveLength(1);
      expect(state.selectedVocabObjs[0].word).toBe('日');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty vocabulary object array', () => {
      useVocabStore.getState().setSelectedVocabObjs([]);
      
      expect(useVocabStore.getState().selectedVocabObjs).toEqual([]);
    });

    it('handles empty vocabulary sets', () => {
      useVocabStore.getState().setSelectedVocabSets([]);
      
      expect(useVocabStore.getState().selectedVocabSets).toEqual([]);
    });

    it('handles vocabulary objects with special characters', () => {
      const specialVocab: IVocabObj = {
        word: '🦊',
        reading: 'きつね',
        meanings: ['fox'],
      };
      
      useVocabStore.getState().addVocabObj(specialVocab);
      
      expect(useVocabStore.getState().selectedVocabObjs[0].word).toBe('🦊');
    });

    it('handles very long vocabulary lists', () => {
      const longList: IVocabObj[] = Array.from({ length: 500 }, (_, i) => ({
        word: `word${i}`,
        reading: `reading${i}`,
        meanings: [`meaning${i}`],
      }));
      
      useVocabStore.getState().setSelectedVocabObjs(longList);
      
      expect(useVocabStore.getState().selectedVocabObjs).toHaveLength(500);
    });
  });
});