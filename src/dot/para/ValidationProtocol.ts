import { Enum } from "../../enum.ts";
import { Scale } from "../scale.ts";
import { ApprovalDistributionMessage } from "./ApprovalDistributionMessage.ts";
import { BitfieldDistributionMessage } from "./BitfieldDistributionMessage.ts";
import { StatementDistributionMessage } from "./StatementDistributionMessage.ts";

export type ValidationProtocol = Enum<{
  BitfieldDistribution: BitfieldDistributionMessage;
  StatementDistribution: StatementDistributionMessage;
  ApprovalDistribution: ApprovalDistributionMessage;
}>;
export function ValidationProtocol(s: Scale): ValidationProtocol {
  return s.enum({
    BitfieldDistribution: [1, () => BitfieldDistributionMessage(s)],
    StatementDistribution: [3, () => StatementDistributionMessage(s)],
    ApprovalDistribution: [4, () => ApprovalDistributionMessage(s)],
  });
}
