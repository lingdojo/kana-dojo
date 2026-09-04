'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHasFinePointer } from '@/shared/hooks/generic/useHasFinePointer';

const normalizeTileText = (value: string) =>
  value
    .normalize('NFC')
    .toLocaleLowerCase()
    .replace(/[\u2018\u2019\u02bc\uff07]/g, "'")
    .replace(/[\u2010-\u2015\u2212\ufe58\ufe63\uff0d]/g, '-')
    .replace(/[\s\u00a0]+/g, ' ');

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
};

export interface TileKeyboardCandidate {
  id: number;
  text: string;
}

export const getTilePrefixMatches = (
  candidates: TileKeyboardCandidate[],
  prefix: string,
) => {
  const normalizedPrefix = normalizeTileText(prefix);
  if (!normalizedPrefix) return [];

  return candidates.filter(candidate =>
    normalizeTileText(candidate.text).startsWith(normalizedPrefix),
  );
};

interface UseTilesModeKeyboardSelectionParams {
  allTiles: Map<number, string>;
  placedTileIds: number[];
  onTileClick: (id: number, char: string) => void;
  enabled: boolean;
  resetKey?: string;
}

export const useTilesModeKeyboardSelection = ({
  allTiles,
  placedTileIds,
  onTileClick,
  enabled,
  resetKey,
}: UseTilesModeKeyboardSelectionParams) => {
  const hasFinePointer = useHasFinePointer();
  const isEnabled = enabled && hasFinePointer;
  const [typedPrefix, setTypedPrefixState] = useState('');
  const typedPrefixRef = useRef('');

  const setTypedPrefix = useCallback((value: string) => {
    typedPrefixRef.current = value;
    setTypedPrefixState(value);
  }, []);

  const clearTypedPrefix = useCallback(
    () => setTypedPrefix(''),
    [setTypedPrefix],
  );

  const candidates = useMemo(() => {
    const placedIds = new Set(placedTileIds);
    return Array.from(allTiles, ([id, text]) => ({ id, text })).filter(
      candidate => !placedIds.has(candidate.id),
    );
  }, [allTiles, placedTileIds]);

  const candidatesRef = useRef(candidates);
  const placedTileIdsRef = useRef(placedTileIds);
  const allTilesRef = useRef(allTiles);
  const onTileClickRef = useRef(onTileClick);

  useEffect(() => {
    candidatesRef.current = candidates;
    placedTileIdsRef.current = placedTileIds;
    allTilesRef.current = allTiles;
    onTileClickRef.current = onTileClick;
  }, [allTiles, candidates, onTileClick, placedTileIds]);

  useEffect(() => {
    // The pending prefix belongs to the current question/device state and must
    // not leak when either changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    clearTypedPrefix();
  }, [allTiles, clearTypedPrefix, isEnabled, resetKey]);

  useEffect(() => {
    if (!isEnabled) return;

    const selectTile = (candidate: TileKeyboardCandidate) => {
      candidatesRef.current = candidatesRef.current.filter(
        currentCandidate => currentCandidate.id !== candidate.id,
      );
      if (!placedTileIdsRef.current.includes(candidate.id)) {
        placedTileIdsRef.current = [...placedTileIdsRef.current, candidate.id];
      }
      setTypedPrefix('');
      onTileClickRef.current(candidate.id, candidate.text);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        isEditableTarget(event.target) ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return;
      }

      if (event.repeat) {
        event.preventDefault();
        return;
      }

      if (event.key === 'Escape') {
        if (typedPrefixRef.current) {
          event.preventDefault();
          setTypedPrefix('');
        }
        return;
      }

      if (event.key === 'Backspace') {
        const currentPrefix = typedPrefixRef.current;
        if (currentPrefix) {
          event.preventDefault();
          setTypedPrefix(Array.from(currentPrefix).slice(0, -1).join(''));
          return;
        }

        const lastPlacedId = placedTileIdsRef.current.at(-1);
        if (lastPlacedId !== undefined) {
          event.preventDefault();
          const char = allTilesRef.current.get(lastPlacedId);
          if (char !== undefined) {
            onTileClickRef.current(lastPlacedId, char);
          }
        }
        return;
      }

      const isCommitKey =
        event.key === 'Enter' || event.code === 'Space' || event.key === ' ';
      if (isCommitKey && typedPrefixRef.current) {
        event.preventDefault();
        const normalizedPrefix = normalizeTileText(typedPrefixRef.current);
        const exactMatch = candidatesRef.current.find(
          candidate => normalizeTileText(candidate.text) === normalizedPrefix,
        );
        if (exactMatch) {
          selectTile(exactMatch);
        } else {
          setTypedPrefix('');
        }
        return;
      }

      if (event.key.length !== 1 || event.key === ' ') return;

      event.preventDefault();
      const nextPrefix = `${typedPrefixRef.current}${event.key}`;
      const matches = getTilePrefixMatches(candidatesRef.current, nextPrefix);

      if (matches.length === 1) {
        selectTile(matches[0]);
      } else if (matches.length > 1) {
        setTypedPrefix(nextPrefix);
      } else if (typedPrefixRef.current) {
        setTypedPrefix('');
      }
    };

    const handleCompositionEnd = (event: CompositionEvent) => {
      if (isEditableTarget(event.target) || !event.data) return;

      let compositionPrefix = typedPrefixRef.current;
      for (const character of Array.from(event.data)) {
        const nextPrefix = `${compositionPrefix}${character}`;
        const matches = getTilePrefixMatches(candidatesRef.current, nextPrefix);
        if (matches.length === 1) {
          selectTile(matches[0]);
          compositionPrefix = '';
        } else if (matches.length > 1) {
          compositionPrefix = nextPrefix;
          setTypedPrefix(compositionPrefix);
        } else if (compositionPrefix) {
          compositionPrefix = '';
          setTypedPrefix('');
        }
      }
    };

    // Capture runs before the session-level Escape and action shortcuts, so a
    // pending prefix gets first refusal without depending on mount order.
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('compositionend', handleCompositionEnd);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, [isEnabled, setTypedPrefix]);

  return {
    typedPrefix,
    clearTypedPrefix,
    isKeyboardSelectionEnabled: isEnabled,
  };
};
