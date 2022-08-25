import { Enum } from "../../enum.ts";
import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";
import { Signed } from "./Signed.ts";
import { Statement } from "./Statement.ts";
import { StatementMetadata } from "./StatementMetadata.ts";

export type StatementDistributionMessage = Enum<{
  Statement: { relay_parent: H256; statement: Signed<Statement> };
  LargeStatement: StatementMetadata;
}>;
export function StatementDistributionMessage(
  s: Scale,
): StatementDistributionMessage {
  return s.enum({
    Statement: [0, () => ({
      relay_parent: s.h256(),
      statement: Signed(Statement)(s),
    })],
    LargeStatement: [1, () => StatementMetadata(s)],
  });
}
