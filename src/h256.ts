import { fromHex0, shortHex, toHex0 } from "./hex.ts";
import { Blake2b } from "https://deno.land/x/blake2b@v0.1.0/mod.ts";

export class H256 {
  s: string;
  static froms(s: string) {
    return new H256(fromHex0(s));
  }
  static blake(a: Uint8Array) {
    return new H256(new Blake2b(32).update(a).digest() as Uint8Array);
  }
  constructor(public a: Uint8Array) {
    if (a.length !== 32) {
      throw new Error();
    }
    this.s = toHex0(a);
  }
  [Symbol.for("Deno.customInspect")]() {
    return this.D;
  }
  get D() {
    return `H256(${shortHex(this.a)})`;
  }
}
