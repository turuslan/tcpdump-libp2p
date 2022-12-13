import { Bits } from "./bits.ts";
import { Bytes } from "./bytes.ts";
import { CollatorId } from "./dot/para/CollatorId.ts";
import { CollatorSignature } from "./dot/para/CollatorSignature.ts";
import { VRFOutput } from "./dot/para/VRFOutput.ts";
import { VRFProof } from "./dot/para/VRFProof.ts";
import { Enum } from "./enum.ts";
import { H256 } from "./h256.ts";
import { PeerId } from "./PeerId.ts";

const S = {
  PeerId,
  H256,
  Bytes,
  Bits,
  CollatorId,
  CollatorSignature,
  VRFOutput,
  VRFProof,
};

const K = "S";
interface S {
  [K]: keyof typeof S;
  s: string;
}

export function fromJson(s: string) {
  return JSON.parse(s, (_k, v) => {
    if (typeof v === "object") {
      if (K in v) {
        return S[v[K] as keyof typeof S].froms(v.s);
      }
      if ("E" in v) {
        return Enum(v.E, v[v.E]);
      }
    }
    return v;
  });
}

export function toJson(v: any) {
  return JSON.stringify(v, (_k, v): S => {
    let k: S[typeof K];
    for (k in S) {
      if (v instanceof S[k]) {
        return { [K]: k, s: v.s };
      }
    }
    return v;
  });
}
