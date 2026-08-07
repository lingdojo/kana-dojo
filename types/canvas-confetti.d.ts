/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'canvas-confetti' {
  export interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    gravity?: number;
    origin?: { x?: number; y?: number };
    shapes?: any[];
    ticks?: number;
    zIndex?: number;
    scalar?: number;
  }
  export interface ShapeFromTextOptions {
    text: string;
    scalar?: number;
  }
  export interface ConfettiFunction {
    (options?: ConfettiOptions): void;
    shapeFromText: (opts: ShapeFromTextOptions) => any;
  }
  const confetti: ConfettiFunction;
  export default confetti;
}
