import { Enum } from "../../enum.ts";
import { tuple } from "../../tuple.ts";
import { Scale } from "../scale.ts";
import { IndirectAssignmentCert } from "./IndirectAssignmentCert.ts";
import { IndirectSignedApprovalVote } from "./IndirectSignedApprovalVote.ts";

export type ApprovalDistributionMessage = Enum<{
  Assignments: [IndirectAssignmentCert, number][];
  Approvals: IndirectSignedApprovalVote[];
}>;
export function ApprovalDistributionMessage(
  s: Scale,
): ApprovalDistributionMessage {
  return s.enum({
    Assignments: [0, () =>
      s.list(
        () => tuple(IndirectAssignmentCert(s), s.u32()),
      )],
    Approvals: [1, () => s.list(() => IndirectSignedApprovalVote(s))],
  });
}
