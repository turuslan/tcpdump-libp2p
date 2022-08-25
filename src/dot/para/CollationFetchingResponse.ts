import { Scale } from "../scale.ts";
import { CandidateReceipt } from "./CandidateReceipt.ts";
import { PoV } from "./PoV.ts";

export interface CollationFetchingResponse {
  receipt: CandidateReceipt;
  pov: PoV;
}
export function CollationFetchingResponse(s: Scale): CollationFetchingResponse {
  return s.enum({
    Collation: [0, () => ({
      receipt: CandidateReceipt(s),
      pov: PoV(s),
    })],
  }).Collation;
}
