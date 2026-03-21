export type ClickSoundId =
  | 'click'
  | 'beep'
  | 'pop'
  | 'nk-creams'
  | 'typewriter'
  | 'osu'
  | 'hitmarker'
  | 'sine'
  | 'sawtooth'
  | 'square'
  | 'triangle'
  | 'pentatonic'
  | 'wholetone'
  | 'fist-fight'
  | 'rubber-keys'
  | 'fart'
  | 'chaos-burst'
  | 'reverse-suck'
  | 'ringmod-zap'
  | 'granular-shatter'
  | 'subdrop-thud'
  | 'silk-chime'
  | 'amber-pluck'
  | 'velvet-tap'
  | 'aqua-bloom'
  | 'luna-glint'
  | 'bamboo-whisper'
  | 'ceramic-kiss'
  | 'rain-glass'
  | 'satin-droplet'
  | 'starlit-ting';

export interface ClickSoundOption {
  id: ClickSoundId;
  label: string;
  monkeytypeId: string | null;
  sourceType: 'file' | 'synthetic-generated';
  variants: string[];
}

export const DEFAULT_CLICK_SOUND_ID: ClickSoundId = 'nk-creams';

export const CLICK_SOUND_OPTIONS: ClickSoundOption[] = [
  {
    id: 'nk-creams',
    label: 'default',
    monkeytypeId: '4',
    sourceType: 'file',
    variants: [
      'click4_1',
      'click4_11',
      'click4_2',
      'click4_22',
      'click4_3',
      'click4_33',
      'click4_4',
      'click4_44',
      'click4_5',
      'click4_55',
      'click4_6',
      'click4_66',
    ],
  },
  {
    id: 'click',
    label: 'click',
    monkeytypeId: '1',
    sourceType: 'file',
    variants: ['click1_1', 'click1_2', 'click1_3'],
  },
  {
    id: 'beep',
    label: 'beep',
    monkeytypeId: '2',
    sourceType: 'file',
    variants: ['click2_1', 'click2_2', 'click2_3'],
  },
  {
    id: 'pop',
    label: 'pop',
    monkeytypeId: '3',
    sourceType: 'file',
    variants: ['click3_1', 'click3_2', 'click3_3'],
  },
  {
    id: 'typewriter',
    label: 'typewriter',
    monkeytypeId: '5',
    sourceType: 'file',
    variants: [
      'click5_1',
      'click5_11',
      'click5_2',
      'click5_22',
      'click5_3',
      'click5_33',
      'click5_4',
      'click5_44',
      'click5_5',
      'click5_55',
      'click5_6',
      'click5_66',
    ],
  },
  {
    id: 'osu',
    label: 'osu',
    monkeytypeId: '6',
    sourceType: 'file',
    variants: [
      'click6_1',
      'click6_11',
      'click6_2',
      'click6_22',
      'click6_3',
      'click6_33',
    ],
  },
  {
    id: 'hitmarker',
    label: 'hitmarker',
    monkeytypeId: '7',
    sourceType: 'file',
    variants: [
      'click7_1',
      'click7_11',
      'click7_2',
      'click7_22',
      'click7_3',
      'click7_33',
    ],
  },
  {
    id: 'sine',
    label: 'sine',
    monkeytypeId: '8',
    sourceType: 'synthetic-generated',
    variants: [
      'sine_01',
      'sine_02',
      'sine_03',
      'sine_04',
      'sine_05',
      'sine_06',
      'sine_07',
      'sine_08',
      'sine_09',
      'sine_10',
    ],
  },
  {
    id: 'sawtooth',
    label: 'sawtooth',
    monkeytypeId: '9',
    sourceType: 'synthetic-generated',
    variants: [
      'sawtooth_01',
      'sawtooth_02',
      'sawtooth_03',
      'sawtooth_04',
      'sawtooth_05',
      'sawtooth_06',
      'sawtooth_07',
      'sawtooth_08',
      'sawtooth_09',
      'sawtooth_10',
    ],
  },
  {
    id: 'square',
    label: 'square',
    monkeytypeId: '10',
    sourceType: 'synthetic-generated',
    variants: [
      'square_01',
      'square_02',
      'square_03',
      'square_04',
      'square_05',
      'square_06',
      'square_07',
      'square_08',
      'square_09',
      'square_10',
    ],
  },
  {
    id: 'triangle',
    label: 'triangle',
    monkeytypeId: '11',
    sourceType: 'synthetic-generated',
    variants: [
      'triangle_01',
      'triangle_02',
      'triangle_03',
      'triangle_04',
      'triangle_05',
      'triangle_06',
      'triangle_07',
      'triangle_08',
      'triangle_09',
      'triangle_10',
    ],
  },
  {
    id: 'pentatonic',
    label: 'pentatonic',
    monkeytypeId: '12',
    sourceType: 'synthetic-generated',
    variants: [
      'pentatonic_01',
      'pentatonic_02',
      'pentatonic_03',
      'pentatonic_04',
      'pentatonic_05',
      'pentatonic_06',
      'pentatonic_07',
      'pentatonic_08',
    ],
  },
  {
    id: 'wholetone',
    label: 'wholetone',
    monkeytypeId: '13',
    sourceType: 'synthetic-generated',
    variants: [
      'wholetone_01',
      'wholetone_02',
      'wholetone_03',
      'wholetone_04',
      'wholetone_05',
      'wholetone_06',
      'wholetone_07',
      'wholetone_08',
    ],
  },
  {
    id: 'fist-fight',
    label: 'fist fight',
    monkeytypeId: '14',
    sourceType: 'file',
    variants: [
      'click14_1',
      'click14_2',
      'click14_3',
      'click14_4',
      'click14_5',
      'click14_6',
      'click14_7',
      'click14_8',
    ],
  },
  {
    id: 'rubber-keys',
    label: 'rubber keys',
    monkeytypeId: '15',
    sourceType: 'file',
    variants: ['click15_1', 'click15_2', 'click15_3', 'click15_4', 'click15_5'],
  },
  {
    id: 'fart',
    label: 'fart',
    monkeytypeId: '16',
    sourceType: 'file',
    variants: [
      'click16_1',
      'click16_10',
      'click16_11',
      'click16_2',
      'click16_3',
      'click16_4',
      'click16_5',
      'click16_6',
      'click16_7',
      'click16_8',
      'click16_9',
    ],
  },
  {
    id: 'chaos-burst',
    label: 'chaos burst',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'chaos-burst_01',
      'chaos-burst_02',
      'chaos-burst_03',
      'chaos-burst_04',
      'chaos-burst_05',
      'chaos-burst_06',
      'chaos-burst_07',
      'chaos-burst_08',
      'chaos-burst_09',
      'chaos-burst_10',
    ],
  },
  {
    id: 'reverse-suck',
    label: 'reverse suck',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'reverse-suck_01',
      'reverse-suck_02',
      'reverse-suck_03',
      'reverse-suck_04',
      'reverse-suck_05',
      'reverse-suck_06',
      'reverse-suck_07',
      'reverse-suck_08',
      'reverse-suck_09',
      'reverse-suck_10',
    ],
  },
  {
    id: 'ringmod-zap',
    label: 'ringmod zap',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'ringmod-zap_01',
      'ringmod-zap_02',
      'ringmod-zap_03',
      'ringmod-zap_04',
      'ringmod-zap_05',
      'ringmod-zap_06',
      'ringmod-zap_07',
      'ringmod-zap_08',
      'ringmod-zap_09',
      'ringmod-zap_10',
    ],
  },
  {
    id: 'granular-shatter',
    label: 'granular shatter',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'granular-shatter_01',
      'granular-shatter_02',
      'granular-shatter_03',
      'granular-shatter_04',
      'granular-shatter_05',
      'granular-shatter_06',
      'granular-shatter_07',
      'granular-shatter_08',
      'granular-shatter_09',
      'granular-shatter_10',
    ],
  },
  {
    id: 'subdrop-thud',
    label: 'subdrop thud',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'subdrop-thud_01',
      'subdrop-thud_02',
      'subdrop-thud_03',
      'subdrop-thud_04',
      'subdrop-thud_05',
      'subdrop-thud_06',
      'subdrop-thud_07',
      'subdrop-thud_08',
      'subdrop-thud_09',
      'subdrop-thud_10',
    ],
  },
  {
    id: 'silk-chime',
    label: 'silk chime',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'silk-chime_01',
      'silk-chime_02',
      'silk-chime_03',
      'silk-chime_04',
      'silk-chime_05',
      'silk-chime_06',
      'silk-chime_07',
      'silk-chime_08',
      'silk-chime_09',
      'silk-chime_10',
    ],
  },
  {
    id: 'amber-pluck',
    label: 'amber pluck',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'amber-pluck_01',
      'amber-pluck_02',
      'amber-pluck_03',
      'amber-pluck_04',
      'amber-pluck_05',
      'amber-pluck_06',
      'amber-pluck_07',
      'amber-pluck_08',
      'amber-pluck_09',
      'amber-pluck_10',
    ],
  },
  {
    id: 'velvet-tap',
    label: 'velvet tap',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'velvet-tap_01',
      'velvet-tap_02',
      'velvet-tap_03',
      'velvet-tap_04',
      'velvet-tap_05',
      'velvet-tap_06',
      'velvet-tap_07',
      'velvet-tap_08',
      'velvet-tap_09',
      'velvet-tap_10',
    ],
  },
  {
    id: 'aqua-bloom',
    label: 'aqua bloom',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'aqua-bloom_01',
      'aqua-bloom_02',
      'aqua-bloom_03',
      'aqua-bloom_04',
      'aqua-bloom_05',
      'aqua-bloom_06',
      'aqua-bloom_07',
      'aqua-bloom_08',
      'aqua-bloom_09',
      'aqua-bloom_10',
    ],
  },
  {
    id: 'luna-glint',
    label: 'luna glint',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'luna-glint_01',
      'luna-glint_02',
      'luna-glint_03',
      'luna-glint_04',
      'luna-glint_05',
      'luna-glint_06',
      'luna-glint_07',
      'luna-glint_08',
      'luna-glint_09',
      'luna-glint_10',
    ],
  },
  {
    id: 'bamboo-whisper',
    label: 'bamboo whisper',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'bamboo-whisper_01',
      'bamboo-whisper_02',
      'bamboo-whisper_03',
      'bamboo-whisper_04',
      'bamboo-whisper_05',
      'bamboo-whisper_06',
      'bamboo-whisper_07',
      'bamboo-whisper_08',
      'bamboo-whisper_09',
      'bamboo-whisper_10',
    ],
  },
  {
    id: 'ceramic-kiss',
    label: 'ceramic kiss',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'ceramic-kiss_01',
      'ceramic-kiss_02',
      'ceramic-kiss_03',
      'ceramic-kiss_04',
      'ceramic-kiss_05',
      'ceramic-kiss_06',
      'ceramic-kiss_07',
      'ceramic-kiss_08',
      'ceramic-kiss_09',
      'ceramic-kiss_10',
    ],
  },
  {
    id: 'rain-glass',
    label: 'rain glass',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'rain-glass_01',
      'rain-glass_02',
      'rain-glass_03',
      'rain-glass_04',
      'rain-glass_05',
      'rain-glass_06',
      'rain-glass_07',
      'rain-glass_08',
      'rain-glass_09',
      'rain-glass_10',
    ],
  },
  {
    id: 'satin-droplet',
    label: 'satin droplet',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'satin-droplet_01',
      'satin-droplet_02',
      'satin-droplet_03',
      'satin-droplet_04',
      'satin-droplet_05',
      'satin-droplet_06',
      'satin-droplet_07',
      'satin-droplet_08',
      'satin-droplet_09',
      'satin-droplet_10',
    ],
  },
  {
    id: 'starlit-ting',
    label: 'starlit ting',
    monkeytypeId: null,
    sourceType: 'synthetic-generated',
    variants: [
      'starlit-ting_01',
      'starlit-ting_02',
      'starlit-ting_03',
      'starlit-ting_04',
      'starlit-ting_05',
      'starlit-ting_06',
      'starlit-ting_07',
      'starlit-ting_08',
      'starlit-ting_09',
      'starlit-ting_10',
    ],
  },
];

export const CLICK_SOUND_OPTIONS_BY_ID: Record<ClickSoundId, ClickSoundOption> =
  CLICK_SOUND_OPTIONS.reduce(
    (acc, option) => {
      acc[option.id] = option;
      return acc;
    },
    {} as Record<ClickSoundId, ClickSoundOption>,
  );

export function getClickSoundVariantBaseUrls(id: ClickSoundId): string[] {
  const option = CLICK_SOUND_OPTIONS_BY_ID[id];
  if (!option) return [];
  return option.variants.map(
    variant => `/sounds/monkeytype-pack/${option.id}/${variant}`,
  );
}
