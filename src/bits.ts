import { fromHex0, toHex0 } from "./hex.ts";

export class Bits {
  s: string;
  static froms(s: string) {
    return new Bits(fromHex0(s));
  }
  constructor(public a: Uint8Array) {
    this.s = toHex0(a);
  }
  [Symbol.for("Deno.customInspect")]() {
    return this.D;
  }
  get D() {
    let s = "";
    for (const x of this.a) {
      for (let i = 0; i < 8; ++i) {
        s += (x & (1 << i)) ? "1" : "0";
      }
    }
    return `Bits(${s.slice(0, s.lastIndexOf("1") + 1)})`;
  }
}
