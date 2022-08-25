import { fromHex0, shortHex, toHex0 } from "../../hex.ts";
import { Scale } from "../scale.ts";

export class VRFProof {
  s: string;
  static froms(s: string) {
    return new VRFProof(fromHex0(s));
  }
  static scale(s: Scale) {
    return new VRFProof(s._blob(64));
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
    return `VRFProof(${shortHex(this.a)})`;
  }
}
