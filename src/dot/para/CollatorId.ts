import { fromHex0, shortHex, toHex0 } from "../../hex.ts";
import { Scale } from "../scale.ts";

export class CollatorId {
  s: string;
  static froms(s: string) {
    return new CollatorId(fromHex0(s));
  }
  static scale(s: Scale) {
    return new CollatorId(s._blob(32));
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
    return `CollatorId(${shortHex(this.a)})`;
  }
}
