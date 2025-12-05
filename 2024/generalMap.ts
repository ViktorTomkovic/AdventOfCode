export abstract class GeneralMap<TKey, TValue, THash = string> {
  keyMap = new Map<THash, TKey>();
  valueMap = new Map<THash, TValue>();
  abstract keyToHash(element: TKey): THash;
  has(key: TKey): boolean {
    const hashedKey = this.keyToHash(key);
    return this.valueMap.has(hashedKey);
  }
  get(key: TKey): TValue | undefined {
    const hashedKey = this.keyToHash(key);
    return this.valueMap.get(hashedKey);
  }
  set(key: TKey, value: TValue): GeneralMap<TKey, TValue, THash> {
    const hashedKey = this.keyToHash(key);
    this.valueMap.set(hashedKey, value);
    this.keyMap.set(hashedKey, key);
    return this;
  }
  keys(): IterableIterator<TKey> {
    return this.keyMap.values();
  }
  delete(key: TKey): boolean {
    const hashedKey = this.keyToHash(key);
    const flag = this.valueMap.delete(hashedKey);
    this.keyMap.delete(hashedKey);
    return flag;
  }
  size(): number {
    return this.valueMap.size;
  }
  putIfAbsent(key: TKey, defaultValueFactory: () => TValue): boolean {
    if (!this.has(key)) {
      const value = defaultValueFactory();
      this.set(key, value);
      return true;
    }
    return false;
  }
  putOrUpdate(
    key: TKey,
    defaultValueFactory: () => TValue,
    updateFn: (existingValue: TValue) => TValue,
  ): boolean {
    if (!this.has(key)) {
      const value = defaultValueFactory();
      this.set(key, value);
      return true;
    }
    const existingValue = this.get(key)!;
    const newValue = updateFn(existingValue);
    this.set(key, newValue);
    return false;
  }
  keyList(): Array<TKey> {
    return [...this.keys()];
  }
  clear(): void {
    this.valueMap.clear();
    this.keyMap.clear();
  }
}

export class JsonStringifyMap<TKey, TValue>
  extends GeneralMap<TKey, TValue, string> {
  private static stringifier = (_key: string, value: unknown): unknown =>
    typeof value === "bigint" ? value.toString() + "n" : value;

  keyToHash(key: TKey): string {
    return JSON.stringify(key, JsonStringifyMap.stringifier, "");
  }
}

export class PositionMap<TValue>
  extends GeneralMap<[number, number], TValue, number> {
  constructor(private hash: number) {
    super();
  }
  keyToHash(key: [number, number]): number {
    return key[0] * this.hash + key[1];
  }
}

export class GeneralMapHashFn<TKey, TValue, THash>
  extends GeneralMap<TKey, TValue, THash> {
  constructor(private hashFunction: (key: TKey) => THash) {
    super();
  }
  override keyToHash(element: TKey): THash {
    return this.hashFunction(element);
  }
}
