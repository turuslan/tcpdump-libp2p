import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";
import { AssignmentCert } from "./AssignmentCert.ts";

export interface IndirectAssignmentCert {
  block_hash: H256;
  validator: number;
  cert: AssignmentCert;
}
export function IndirectAssignmentCert(s: Scale): IndirectAssignmentCert {
  return {
    block_hash: s.h256(),
    validator: s.u32(),
    cert: AssignmentCert(s),
  };
}
