import { fromHex0, shortHex, toHex0 } from "../../hex.ts";
import { Scale } from "../scale.ts";

export class VRFOutput {
  s: string;
  static froms(s: string) {
    return new VRFOutput(fromHex0(s));
  }
  static scale(s: Scale) {
    return new VRFOutput(s._blob(32));
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
    return `VRFOutput(${shortHex(this.a)})`;
  }
}
