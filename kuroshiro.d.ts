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
  class KuromojiAnalyzer {
    constructor(options?: { dictPath?: string });
    init(): Promise<void>;
  }

  export default KuromojiAnalyzer;
}
