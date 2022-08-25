import { Scale } from "../scale.ts";
import { CandidateCommitments } from "./CandidateCommitments.ts";
import { CandidateDescriptor } from "./CandidateDescriptor.ts";

export interface CommittedCandidateReceipt {
  descriptor: CandidateDescriptor;
  commitments: CandidateCommitments;
}
export function CommittedCandidateReceipt(s: Scale): CommittedCandidateReceipt {
  return {
    descriptor: CandidateDescriptor(s),
    commitments: CandidateCommitments(s),
  };
}
