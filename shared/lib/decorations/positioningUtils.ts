import { Random } from 'random-js';

// ============================================================================
// TYPES
// ============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface ExclusionZone {
  x: number; // center x
  y: number; // center y
  width: number; // total width
  height: number; // total height
}

// ============================================================================
// RADIUS CALCULATIONS
// ============================================================================

/**
 * Calculate base radius based on viewport width and character size
 * Mobile devices get tighter spacing, desktop gets more generous spacing
 */
export const getBaseRadius = (
  viewportWidth: number,
  charSize: number,
): number => {
  // Mobile: tighter spacing
  if (viewportWidth < 768) return charSize * 1.5;
  // Tablet: medium spacing
  if (viewportWidth < 1024) return charSize * 2;
  // Desktop: generous spacing
  return charSize * 2.5;
};

/**
 * Calculate personal radius based on character count
 * Uses logarithmic scale: fewer chars = more space, more chars = less space
 * @param count Number of characters to place
 * @param baseRadius Base radius from viewport calculation
 * @returns Personal radius for each character
 */
export const calculatePersonalRadius = (
  count: number,
  baseRadius: number,
): number => {
  // Inverse relationship: fewer chars = more space
  const minMultiplier = 0.8; // At count=25
  const maxMultiplier = 3.0; // At count=1

  // Logarithmic interpolation for smooth transition
  const t = Math.log(count) / Math.log(25);
  const multiplier = maxMultiplier - (maxMultiplier - minMultiplier) * t;

  return baseRadius * multiplier;
};

// ============================================================================
// COLLISION DETECTION
// ============================================================================

/**
 * Check if position is inside the exclusion zone
 * Exclusion zone is expanded by the personal radius
 */
export const isInExclusionZone = (
  x: number,
  y: number,
  zone: ExclusionZone,
  radius: number,
): boolean => {
  const halfWidth = zone.width / 2 + radius;
  const halfHeight = zone.height / 2 + radius;

  return (
    x > zone.x - halfWidth &&
    x < zone.x + halfWidth &&
    y > zone.y - halfHeight &&
    y < zone.y + halfHeight
  );
};

/**
 * Check if position collides with any existing positions
 * Uses personal radius to maintain minimum distance
 */
export const hasCollision = (
  x: number,
  y: number,
  positions: Position[],
  radius: number,
): boolean => {
  const minDistance = radius * 2; // Personal space diameter

  return positions.some(pos => {
    const dx = x - pos.x;
    const dy = y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < minDistance;
  });
};

// ============================================================================
// POSITION GENERATION
// ============================================================================

/**
 * Generate random positions for characters using rejection sampling
 * Ensures no overlaps and respects exclusion zone
 *
 * @param count Number of positions to generate
 * @param viewportWidth Width of the viewport
 * @param viewportHeight Height of the viewport
 * @param charSize Size of each character in pixels
 * @param exclusionZone Central area to avoid
 * @param rng Random number generator from random-js
 * @returns Array of positions
 */
export const generateRandomPositions = (
  count: number,
  viewportWidth: number,
  viewportHeight: number,
  charSize: number,
  exclusionZone: ExclusionZone,
  rng: Random,
): Position[] => {
  const baseRadius = getBaseRadius(viewportWidth, charSize);
  const personalRadius = calculatePersonalRadius(count, baseRadius);

  const positions: Position[] = [];
  const maxAttempts = 200; // Increased for better distribution

  // Create a deadzone padding to ensure characters never extend outside viewport.
  // Since we use translate(-50%, -50%) to center characters on their position,
  // a character extends charSize/2 in each direction from its center point.
  // Therefore, we need a deadzone of at least charSize/2 on each edge.
  // We use charSize (100% of character size) for extra safety margin.
  const deadzoneEdge = charSize;

  for (let i = 0; i < count; i++) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < maxAttempts) {
      // Generate random position within safe viewport bounds (excluding deadzone)
      const x = rng.real(deadzoneEdge, viewportWidth - deadzoneEdge);
      const y = rng.real(deadzoneEdge, viewportHeight - deadzoneEdge);

      // Check all constraints
      if (
        !isInExclusionZone(x, y, exclusionZone, personalRadius) &&
        !hasCollision(x, y, positions, personalRadius)
      ) {
        positions.push({ x, y });
        placed = true;
      }
      attempts++;
    }

    // Fallback: place with same constraints if max attempts reached
    // Always respect deadzone to prevent characters from extending outside viewport
    if (!placed) {
      const x = rng.real(deadzoneEdge, viewportWidth - deadzoneEdge);
      const y = rng.real(deadzoneEdge, viewportHeight - deadzoneEdge);
      positions.push({ x, y });
    }
  }

  return positions;
};

/**
 * Get responsive character size based on viewport width
 */
export const getResponsiveCharSize = (viewportWidth: number): number => {
  if (viewportWidth < 768) return 24; // text-2xl
  if (viewportWidth < 1024) return 30; // text-3xl
  return 36; // text-4xl
};

/**
 * Get responsive exclusion zone based on viewport
 */
export const getExclusionZone = (
  viewportWidth: number,
  viewportHeight: number,
): ExclusionZone => {
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;

  return {
    x: centerX,
    y: centerY,
    width: viewportWidth < 768 ? 300 : 500,
    height: viewportWidth < 768 ? 400 : 600,
  };
};
