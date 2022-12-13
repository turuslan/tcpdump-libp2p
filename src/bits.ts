import { fromHex0, toHex0 } from "./hex.ts";

export class Bits {
  s: string;
  static froms(s: string) {
    const m = s.match(/^(\d+):(0x(?:[0-9a-f]{2})*)$/)!;
    return new Bits(+m[1], fromHex0(m[2]));
  }
  constructor(public n: number, public a: Uint8Array) {
    this.s = `${n}:${toHex0(a)}`;
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
    return `Bits(${this.n} ${s.slice(0, this.n)})`;
  }
}
