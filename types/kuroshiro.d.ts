declare module 'kuroshiro' {
  interface KuroshiroOptions {
    to: 'hiragana' | 'katakana' | 'romaji';
    mode?: 'normal' | 'spaced' | 'okurigana' | 'furigana';
    romajiSystem?: 'nippon' | 'passport' | 'hepburn';
    delimiter_start?: string;
    delimiter_end?: string;
  }

  interface Analyzer {
    init(): Promise<void>;
  }

  class Kuroshiro {
    init(analyzer: Analyzer): Promise<void>;
    convert(text: string, options: KuroshiroOptions): Promise<string>;
  }

  export default Kuroshiro;
}

declare module 'kuroshiro-analyzer-kuromoji' {
  interface KuromojiToken {
    surface_form: string;
    pos: string;
    pos_detail_1: string;
    pos_detail_2: string;
    pos_detail_3: string;
    conjugated_type: string;
    conjugated_form: string;
    basic_form: string;
    reading: string;
    pronunciation: string;
  }

  class KuromojiAnalyzer {
    constructor(options?: { dictPath?: string });
    init(): Promise<void>;
    parse(text: string): Promise<KuromojiToken[]>;
  }

  export type { KuromojiToken };
  export default KuromojiAnalyzer;
}
