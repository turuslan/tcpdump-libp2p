import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";

export interface ChunkFetchingRequest {
  candidate_hash: H256;
  index: number;
}
export function ChunkFetchingRequest(s: Scale): ChunkFetchingRequest {
  return {
    candidate_hash: s.h256(),
    index: s.u32(),
  };
}
