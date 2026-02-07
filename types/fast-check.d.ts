declare module 'fast-check' {
  namespace fc {
    interface Arbitrary<T> {
      readonly __fastCheckBrand?: T;
      map<U>(mapper: (value: T) => U): Arbitrary<U>;
      filter(predicate: (value: T) => boolean): Arbitrary<T>;
      chain<U>(mapper: (value: T) => Arbitrary<U>): Arbitrary<U>;
    }

    type ArbitraryTuple<T extends unknown[]> = {
      [K in keyof T]: Arbitrary<T[K]>;
    };

    function property<TArgs extends unknown[]>(
      ...args: [...ArbitraryTuple<TArgs>, (...args: TArgs) => unknown]
    ): unknown;

    function asyncProperty<TArgs extends unknown[]>(
      ...args: [...ArbitraryTuple<TArgs>, (...args: TArgs) => Promise<unknown>]
    ): unknown;

    function assert(property: unknown, params?: unknown): void;

    function constant<T>(value: T): Arbitrary<T>;
    function constantFrom<T>(...values: T[]): Arbitrary<T>;
    function option<T>(
      arbitrary: Arbitrary<T>,
      constraints?: unknown,
    ): Arbitrary<T | null>;

    function record<T extends Record<string, unknown>>(
      model: { [K in keyof T]: Arbitrary<T[K]> },
      constraints?: unknown,
    ): Arbitrary<T>;

    function array<T>(
      arbitrary: Arbitrary<T>,
      constraints?: unknown,
    ): Arbitrary<T[]>;

    function tuple<T extends unknown[]>(
      ...arbitraries: ArbitraryTuple<T>
    ): Arbitrary<T>;

    function oneof<T extends unknown[]>(
      ...arbitraries: ArbitraryTuple<T>
    ): Arbitrary<T[number]>;

    function frequency<T extends unknown[]>(
      ...weightedArbs: { weight: number; arbitrary: Arbitrary<T[number]> }[]
    ): Arbitrary<T[number]>;

    function string(constraints?: unknown): Arbitrary<string>;
    function stringMatching(
      pattern: RegExp | string,
      constraints?: unknown,
    ): Arbitrary<string>;
    function integer(constraints?: unknown): Arbitrary<number>;
    function double(constraints?: unknown): Arbitrary<number>;
    function boolean(): Arbitrary<boolean>;
    function webUrl(): Arbitrary<string>;
    function uint8Array(constraints?: {
      minLength?: number;
      maxLength?: number;
    }): Arbitrary<Uint8Array>;
  }

  const fc: {
    Arbitrary: fc.Arbitrary<unknown>;
    property: typeof fc.property;
    asyncProperty: typeof fc.asyncProperty;
    assert: typeof fc.assert;
    constant: typeof fc.constant;
    constantFrom: typeof fc.constantFrom;
    option: typeof fc.option;
    record: typeof fc.record;
    array: typeof fc.array;
    tuple: typeof fc.tuple;
    oneof: typeof fc.oneof;
    frequency: typeof fc.frequency;
    string: typeof fc.string;
    stringMatching: typeof fc.stringMatching;
    integer: typeof fc.integer;
    double: typeof fc.double;
    boolean: typeof fc.boolean;
    webUrl: typeof fc.webUrl;
    uint8Array: typeof fc.uint8Array;
    [key: string]: unknown;
  };

  export = fc;
}
