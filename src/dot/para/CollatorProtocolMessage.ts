import { Enum } from "../../enum.ts";
import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";
import { CollatorId } from "./CollatorId.ts";
import { CollatorSignature } from "./CollatorSignature.ts";
import { Statement } from "./Statement.ts";
import { Signed } from "./Signed.ts";

export type CollatorProtocolMessage = Enum<{
  Declare: { collator: CollatorId; para: number; sig: CollatorSignature };
  AdvertiseCollation: { relay_parent: H256 };
  CollationSeconded: { relay_parent: H256; statement: Signed<Statement> };
}>;
export function CollatorProtocolMessage(s: Scale): CollatorProtocolMessage {
  return s.enum({
    _0: [0, () =>
      s.enum({
        Declare: [0, () => ({
          collator: CollatorId.scale(s),
          para: s.u32(),
          sig: CollatorSignature.scale(s),
        })],
        AdvertiseCollation: [1, () => ({ relay_parent: s.h256() })],
        CollationSeconded: [4, () => ({
          relay_parent: s.h256(),
          statement: Signed(Statement)(s),
        })],
      })],
  })._0;
}
