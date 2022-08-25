import { Enum } from "../../enum.ts";
import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";
import { CommittedCandidateReceipt } from "./CommittedCandidateReceipt.ts";

export type Statement = Enum<{
  Seconded: CommittedCandidateReceipt;
  Valid: H256;
}>;
export function Statement(s: Scale): Statement {
  return s.enum({
    Seconded: [1, () => CommittedCandidateReceipt(s)],
    Valid: [2, () => s.h256()],
  });
}
