import { Bytes } from "../../bytes.ts";
import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";

export interface PoV {
  data: Bytes;
  hash: H256;
}
export function PoV(s: Scale): PoV {
  const { o } = s;
  return {
    data: s.bytes(),
    hash: H256.blake(s.a.subarray(o, s.o)),
  };
}
