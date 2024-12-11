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
  putIfAbsent(key: TKey, defaultValueFactory: () => TValue): boolean {
    if (!this.has(key)) {
      const value = defaultValueFactory();
      this.set(key, value);
      return true;
    }
    return false;
  }
  keys(): IterableIterator<TKey> {
    return this.keyMap.values();
  }
  keyList(): Array<TKey> {
    return [...this.keys()];
  }
  delete(key: TKey): boolean {
    const hashedKey = this.keyToHash(key);
    const flag = this.valueMap.delete(hashedKey);
    this.keyMap.delete(hashedKey);
    return flag;
  }
  clear(): void {
    this.valueMap.clear();
    this.keyMap.clear();
  }
  size(): number {
    return this.valueMap.size;
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
