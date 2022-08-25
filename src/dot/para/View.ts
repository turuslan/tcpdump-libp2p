import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";

export interface View {
  heads: H256[];
  finalized_number: number;
}
export function View(s: Scale): View {
  return {
    heads: s.list(() => s.h256()),
    finalized_number: s.u32(),
  };
}
