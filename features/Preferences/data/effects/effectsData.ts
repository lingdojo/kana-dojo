export interface EffectDefinition {
  id: string;
  name: string;
  emoji: string;
}

// Single source of truth — both cursor trail and click effects draw from this list.
export const EFFECTS: EffectDefinition[] = [
  { id: 'none', name: 'None', emoji: '' },
  { id: 'sakura', name: 'Sakura Petals', emoji: '\u{1F338}' },
  { id: 'maple', name: 'Momiji', emoji: '\u{1F342}' },
  { id: 'bamboo', name: 'Bamboo', emoji: '\u{1F38B}' },
  { id: 'lantern', name: 'Lantern', emoji: '\u{1F3EE}' },
  { id: 'lotus', name: 'Lotus', emoji: '\u{1FAB7}' },
  { id: 'wave', name: 'Wave', emoji: '\u{1F30A}' },
  { id: 'sparkle', name: 'Sparkle', emoji: '\u2728' },
  { id: 'star', name: 'Star', emoji: '\u2B50' },
  { id: 'snowflake', name: 'Snowflake', emoji: '\u2744\uFE0F' },
  { id: 'fish', name: 'Koi', emoji: '\u{1F41F}' },
  { id: 'butterfly', name: 'Butterfly', emoji: '\u{1F98B}' },
  { id: 'firework', name: 'Firework', emoji: '\u{1F386}' },
  { id: 'festival', name: 'Festival', emoji: '\u{1F38A}' },
  { id: 'moon', name: 'Moon', emoji: '\u{1F319}' },
  { id: 'fuji', name: 'Fuji', emoji: '\u{1F5FB}' },
  { id: 'wind', name: 'Wind Chime', emoji: '\u{1F390}' },
  { id: 'rice', name: 'Onigiri', emoji: '\u{1F359}' },
  { id: 'tea', name: 'Matcha', emoji: '\u{1F375}' },
  { id: 'fan', name: 'Fan', emoji: '\u{1FAAD}' },
  { id: 'blossom', name: 'Blossom', emoji: '\u{1F33A}' },
  { id: 'torii', name: 'Torii', emoji: '\u26E9\uFE0F' },
  { id: 'dango', name: 'Dango', emoji: '\u{1F361}' },
  { id: 'sushi', name: 'Sushi', emoji: '\u{1F363}' },
  { id: 'ramen', name: 'Ramen', emoji: '\u{1F35C}' },
  { id: 'castle', name: 'Castle', emoji: '\u{1F3EF}' },
  { id: 'carp', name: 'Koinobori', emoji: '\u{1F38F}' },
  { id: 'kitsune', name: 'Kitsune', emoji: '\u{1F98A}' },
  { id: 'chopsticks', name: 'Chopsticks', emoji: '\u{1F962}' },
  { id: 'hina', name: 'Hina Dolls', emoji: '\u{1F38E}' },
  { id: 'senbei', name: 'Senbei', emoji: '\u{1F358}' },
  { id: 'dragon', name: 'Dragon', emoji: '\u{1F409}' },
  { id: 'tsukimi', name: 'Tsukimi', emoji: '\u{1F391}' },
  { id: 'sake', name: 'Sake', emoji: '\u{1F376}' },
  { id: 'gyoza', name: 'Gyoza', emoji: '\u{1F95F}' },
  { id: 'bento', name: 'Bento', emoji: '\u{1F371}' },
  { id: 'deer', name: 'Nara Deer', emoji: '\u{1F98C}' },
  { id: 'narutomaki', name: 'Narutomaki', emoji: '\u{1F365}' },
  { id: 'redenvelope', name: 'Red Envelope', emoji: '\u{1F9E7}' },
  { id: 'mooncake', name: 'Moon Cake', emoji: '\u{1F96E}' },
  { id: 'kadomatsu', name: 'Kadomatsu', emoji: '\u{1F38D}' },
  { id: 'sunrise', name: 'Sunrise', emoji: '\u{1F305}' },
  { id: 'sunface', name: 'Sun', emoji: '\u{1F31E}' },
  { id: 'fugu', name: 'Fugu', emoji: '\u{1F421}' },
  { id: 'kabuki', name: 'Kabuki', emoji: '\u{1F3AD}' },
  { id: 'firecracker', name: 'Firecracker', emoji: '\u{1F9E8}' },
  { id: 'panda', name: 'Panda', emoji: '\u{1F43C}' },
  { id: 'hanafuda', name: 'Hanafuda', emoji: '\u{1F3B4}' },
  { id: 'tokyotower', name: 'Tokyo Tower', emoji: '\u{1F5FC}' },
  { id: 'curry', name: 'Japanese Curry', emoji: '\u{1F35B}' },
  { id: 'moonrabbit', name: 'Moon Rabbit', emoji: '\u{1F430}' },
];

// Aliases kept for backward compatibility with renderers and stores.
export const CURSOR_TRAIL_EFFECTS = EFFECTS;

// Click effects shown in a different static order so the two grids don't look identical.
const CLICK_ORDER = ["none","kabuki","fish","butterfly","fuji","wind","snowflake","firework","gyoza","narutomaki","lantern","maple","bento","lotus","chopsticks","ramen","castle","tokyotower","blossom","rice","senbei","sushi","sakura","torii","tea","kitsune","mooncake","sake","hanafuda","hina","carp","fan","moonrabbit","star","firecracker","fugu","tsukimi","moon","curry","dango","panda","deer","kadomatsu","festival","bamboo","redenvelope","sunrise","sparkle","dragon","wave","sunface"];
const _effectById = new Map(EFFECTS.map(e => [e.id, e]));
export const CLICK_EFFECTS = CLICK_ORDER.map(id => _effectById.get(id)!);

