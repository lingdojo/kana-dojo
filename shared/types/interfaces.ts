export interface IGroup {
  group: 'jlpt' | 'joyo';
}

export interface ISubgroup extends IGroup {
  subgroup:
    | 'n5'
    | 'n4'
    | 'n3'
    | 'n2'
    | 'n1'
    | 'grade-1'
    | 'grade-2'
    | 'grade-3'
    | 'grade-4'
    | 'grade-5'
    | 'grade-6';
}

export interface IWordClass extends ISubgroup {
  wordClass: 'nouns' | 'verbs' | 'adjectives' | 'adverbs';
}

export interface ISet extends IWordClass {
  set: string;
}

export interface IWord {
  word: string;
  reading: string;
  displayMeanings: string[];
  meanings: string[];
}
