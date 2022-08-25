import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";

export interface CollationFetchingRequest {
  relay_parent: H256;
  para_id: number;
}
export function CollationFetchingRequest(s: Scale): CollationFetchingRequest {
  return {
    relay_parent: s.h256(),
    para_id: s.u32(),
  };
}
