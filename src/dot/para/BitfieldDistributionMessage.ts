import { Bits } from "../../bits.ts";
import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";
import { Signed } from "./Signed.ts";

export interface BitfieldDistributionMessage {
  relay_parent: H256;
  bits: Signed<Bits>;
}
export function BitfieldDistributionMessage(
  s: Scale,
): BitfieldDistributionMessage {
  return s.enum({
    _0: [0, () => ({
      relay_parent: s.h256(),
      bits: Signed((s) => s.bits())(s),
    })],
  })._0;
}
