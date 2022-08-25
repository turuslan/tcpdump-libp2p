import { fromHex0, shortHex, toHex0 } from "./hex.ts";

export class Bytes {
  s: string;
  static froms(s: string) {
    return new Bytes(fromHex0(s));
  }
  constructor(public a: Uint8Array) {
    this.s = toHex0(a);
  }
  [Symbol.for("Deno.customInspect")]() {
    return this.D;
  }
  get D() {
    if (this.a.length === 0) {
      return "Bytes()";
    }
    return `Bytes(${this.a.length} ${shortHex(this.a)})`;
  }
}
