import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";
import { CollatorSignature } from "./CollatorSignature.ts";

export interface StatementMetadata {
  relay_parent: H256;
  candidate_hash: H256;
  signed_by: number;
  signature: CollatorSignature;
}
export function StatementMetadata(s: Scale): StatementMetadata {
  return {
    relay_parent: s.h256(),
    candidate_hash: s.h256(),
    signed_by: s.u32(),
    signature: CollatorSignature.scale(s),
  };
}
