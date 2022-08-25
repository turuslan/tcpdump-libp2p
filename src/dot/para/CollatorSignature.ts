import { fromHex0, shortHex, toHex0 } from "../../hex.ts";
import { Scale } from "../scale.ts";

export class CollatorSignature {
  s: string;
  static froms(s: string) {
    return new CollatorSignature(fromHex0(s));
  }
  static scale(s: Scale) {
    return new CollatorSignature(s._blob(64));
  }
  constructor(public a: Uint8Array) {
    if (a.length !== 64) {
      throw new Error();
    }
    this.s = toHex0(a);
  }
  [Symbol.for("Deno.customInspect")]() {
    return this.D;
  }
  get D() {
    return `CollatorSignature(${shortHex(this.a)})`;
  }
}
