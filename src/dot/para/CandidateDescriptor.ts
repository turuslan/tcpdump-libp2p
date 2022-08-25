import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";
import { CollatorId } from "./CollatorId.ts";
import { CollatorSignature } from "./CollatorSignature.ts";

export interface CandidateDescriptor {
  para_id: number;
  relay_parent: H256;
  collator: CollatorId;
  persisted_validation_data_hash: H256;
  pov_hash: H256;
  erasure_root: H256;
  signature: CollatorSignature;
  para_head: H256;
  validation_code_hash: H256;
}
export function CandidateDescriptor(s: Scale): CandidateDescriptor {
  return {
    para_id: s.u32(),
    relay_parent: s.h256(),
    collator: CollatorId.scale(s),
    persisted_validation_data_hash: s.h256(),
    pov_hash: s.h256(),
    erasure_root: s.h256(),
    signature: CollatorSignature.scale(s),
    para_head: s.h256(),
    validation_code_hash: s.h256(),
  };
}
