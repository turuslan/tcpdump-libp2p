import { H256 } from "../h256.ts";
import { Digest } from "./Digest.ts";
import { Scale } from "./scale.ts";

export interface BlockHeader {
  parent_hash: H256;
  number: number;
  state_root: H256;
  extrinsics_root: H256;
  digest: Digest[];
  hash: H256;
}
export function BlockHeader(s: Scale): BlockHeader {
  const { o } = s;
  return {
    parent_hash: s.h256(),
    number: s.u(),
    state_root: s.h256(),
    extrinsics_root: s.h256(),
    digest: s.list(() => Digest(s)),
    hash: H256.blake(s.a.subarray(o, s.o)),
  };
}
