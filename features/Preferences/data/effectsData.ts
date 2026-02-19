export type RenderStyle = 'svg' | 'emoji' | 'canvas';

export interface EffectDefinition {
  id: string;
  name: string;
  renderStyle: RenderStyle;
  description?: string;
}

export const CURSOR_TRAIL_EFFECTS: EffectDefinition[] = [
  {
    id: 'none',
    name: 'None',
    renderStyle: 'canvas',
    description: 'No cursor trail',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    renderStyle: 'svg',
    description: 'Pink petals drift and flutter behind your cursor',
  },
  {
    id: 'momiji',
    name: 'Momiji',
    renderStyle: 'svg',
    description: 'Red maple leaves tumble and fall',
  },
  {
    id: 'ink-drop',
    name: 'Ink Drop',
    renderStyle: 'svg',
    description: 'Sumi-e ink teardrops trail your movement',
  },
  {
    id: 'koi',
    name: 'Koi Stream',
    renderStyle: 'svg',
    description: 'Koi fish silhouettes follow your cursor in a stream',
  },
  {
    id: 'firefly',
    name: 'Firefly',
    renderStyle: 'svg',
    description: 'Soft glowing orbs linger and float upward',
  },
  {
    id: 'kanji',
    name: 'Kanji',
    renderStyle: 'emoji',
    description: 'Japanese characters drift behind your cursor',
  },
];

export const CLICK_EFFECTS: EffectDefinition[] = [
  {
    id: 'none',
    name: 'None',
    renderStyle: 'canvas',
    description: 'No click effect',
  },
  {
    id: 'sakura-burst',
    name: 'Sakura Burst',
    renderStyle: 'svg',
    description: 'Sakura petals scatter outward on every click',
  },
  {
    id: 'ink-splash',
    name: 'Ink Splash',
    renderStyle: 'svg',
    description: 'Sumi-e ink drops burst radially from each click',
  },
  {
    id: 'torii',
    name: 'Torii',
    renderStyle: 'svg',
    description: 'Mini torii gates shoot outward in a starburst',
  },
  {
    id: 'shockwave',
    name: 'Shockwave',
    renderStyle: 'canvas',
    description: 'A clean expanding ring fades out quickly',
  },
  {
    id: 'momiji-rain',
    name: 'Momiji Rain',
    renderStyle: 'emoji',
    description: '🍂 Maple leaves rain from the click point',
  },
  {
    id: 'festival',
    name: 'Festival',
    renderStyle: 'emoji',
    description: '🏮🌸🎋 Festive Japanese emoji burst outward',
  },
];
