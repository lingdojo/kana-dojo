export interface EffectDefinition {
  id: string;
  name: string;
  emoji: string;
  description?: string;
}

// ─── Japan-themed emoji pool ──────────────────────────────────────────────────

export const CURSOR_TRAIL_EFFECTS: EffectDefinition[] = [
  { id: 'none', name: 'None', emoji: '', description: 'No cursor trail' },
  {
    id: 'sakura',
    name: 'Sakura',
    emoji: '🌸',
    description: 'Cherry blossom petals drift behind your cursor',
  },
  {
    id: 'maple',
    name: 'Momiji',
    emoji: '🍂',
    description: 'Autumn maple leaves tumble and fall',
  },
  {
    id: 'bamboo',
    name: 'Bamboo',
    emoji: '🎋',
    description: 'Tanabata bamboo leaves trail your movement',
  },
  {
    id: 'lantern',
    name: 'Lantern',
    emoji: '🏮',
    description: 'Paper lanterns float gently behind your cursor',
  },
  {
    id: 'lotus',
    name: 'Lotus',
    emoji: '🪷',
    description: 'Lotus flowers bloom in your wake',
  },
  {
    id: 'wave',
    name: 'Wave',
    emoji: '🌊',
    description: 'Ocean waves ripple behind your cursor',
  },
  {
    id: 'sparkle',
    name: 'Sparkle',
    emoji: '✨',
    description: 'Shimmering sparkles trail your movement',
  },
  {
    id: 'star',
    name: 'Star',
    emoji: '⭐',
    description: 'Stars twinkle behind your cursor',
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    emoji: '❄️',
    description: 'Snowflakes drift gently behind your cursor',
  },
  {
    id: 'fish',
    name: 'Koi',
    emoji: '🐟',
    description: 'Koi fish swim in a stream behind your cursor',
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    emoji: '🦋',
    description: 'Butterflies flutter behind your cursor',
  },
  {
    id: 'moon',
    name: 'Moon',
    emoji: '🌙',
    description: 'Crescent moons trail your movement',
  },
  {
    id: 'fuji',
    name: 'Fuji',
    emoji: '🗻',
    description: 'Mount Fuji icons trail behind your cursor',
  },
  {
    id: 'wind',
    name: 'Wind Chime',
    emoji: '🎐',
    description: 'Wind chimes tinkle behind your cursor',
  },
  {
    id: 'rice',
    name: 'Onigiri',
    emoji: '🍙',
    description: 'Rice balls bounce behind your cursor',
  },
  {
    id: 'tea',
    name: 'Matcha',
    emoji: '🍵',
    description: 'Tea cups float behind your cursor',
  },
  {
    id: 'fan',
    name: 'Fan',
    emoji: '🪭',
    description: 'Folding fans flutter in your wake',
  },
  {
    id: 'blossom',
    name: 'Blossom',
    emoji: '🌺',
    description: 'Hibiscus blossoms trail your cursor',
  },
  {
    id: 'kanji',
    name: 'Kanji',
    emoji: '花',
    description: 'Japanese characters drift behind your cursor',
  },
];

export const CLICK_EFFECTS: EffectDefinition[] = [
  { id: 'none', name: 'None', emoji: '', description: 'No click effect' },
  {
    id: 'sakura',
    name: 'Sakura Burst',
    emoji: '🌸',
    description: 'Cherry blossoms scatter from each click',
  },
  {
    id: 'maple',
    name: 'Momiji Rain',
    emoji: '🍂',
    description: 'Maple leaves rain from the click point',
  },
  {
    id: 'bamboo',
    name: 'Bamboo',
    emoji: '🎋',
    description: 'Tanabata bamboo bursts from each click',
  },
  {
    id: 'lantern',
    name: 'Lantern',
    emoji: '🏮',
    description: 'Paper lanterns burst outward on click',
  },
  {
    id: 'lotus',
    name: 'Lotus',
    emoji: '🪷',
    description: 'Lotus flowers blossom from each click',
  },
  {
    id: 'wave',
    name: 'Wave',
    emoji: '🌊',
    description: 'Waves ripple outward from each click',
  },
  {
    id: 'sparkle',
    name: 'Sparkle',
    emoji: '✨',
    description: 'Sparkles burst from each click',
  },
  {
    id: 'star',
    name: 'Star Burst',
    emoji: '⭐',
    description: 'Stars explode from each click',
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    emoji: '❄️',
    description: 'Snowflakes scatter from each click',
  },
  {
    id: 'fish',
    name: 'Koi Splash',
    emoji: '🐟',
    description: 'Koi fish scatter from each click',
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    emoji: '🦋',
    description: 'Butterflies scatter from every click',
  },
  {
    id: 'firework',
    name: 'Firework',
    emoji: '🎆',
    description: 'Fireworks explode from each click',
  },
  {
    id: 'festival',
    name: 'Festival',
    emoji: '🎊',
    description: 'Festival confetti bursts on each click',
  },
  {
    id: 'fuji',
    name: 'Fuji',
    emoji: '🗻',
    description: 'Mount Fuji icons scatter on click',
  },
  {
    id: 'wind',
    name: 'Wind Chime',
    emoji: '🎐',
    description: 'Wind chimes scatter on each click',
  },
  {
    id: 'rice',
    name: 'Onigiri',
    emoji: '🍙',
    description: 'Rice balls scatter on each click',
  },
  {
    id: 'tea',
    name: 'Matcha',
    emoji: '🍵',
    description: 'Tea cups scatter on each click',
  },
  {
    id: 'fan',
    name: 'Fan',
    emoji: '🪭',
    description: 'Folding fans scatter on each click',
  },
  {
    id: 'blossom',
    name: 'Blossom',
    emoji: '🌺',
    description: 'Hibiscus blossoms burst from each click',
  },
];

// Kanji trail uses a random pool instead of a single emoji
export const KANJI_POOL = [
  '花',
  '道',
  '愛',
  '心',
  '雪',
  '月',
  '桜',
  '平',
  '和',
  '風',
  '夢',
  '光',
  '空',
  '海',
];
