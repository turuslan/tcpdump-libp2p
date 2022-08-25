import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";
import { CandidateDescriptor } from "./CandidateDescriptor.ts";

export interface CandidateReceipt {
  descriptor: CandidateDescriptor;
  commitments_hash: H256;
}
export function CandidateReceipt(s: Scale): CandidateReceipt {
  return {
    descriptor: CandidateDescriptor(s),
    commitments_hash: s.h256(),
  };
}
