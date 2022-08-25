import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";
import { CollatorSignature } from "./CollatorSignature.ts";

export interface IndirectSignedApprovalVote {
  block_hash: H256;
  candidate_index: number;
  validator: number;
  signature: CollatorSignature;
}
export function IndirectSignedApprovalVote(
  s: Scale,
): IndirectSignedApprovalVote {
  return {
    block_hash: s.h256(),
    candidate_index: s.u32(),
    validator: s.u32(),
    signature: CollatorSignature.scale(s),
  };
}
