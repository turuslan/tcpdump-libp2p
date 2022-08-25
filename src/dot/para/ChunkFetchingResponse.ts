import { Bytes } from "../../bytes.ts";
import { Scale } from "../scale.ts";

interface ChunkResponse {
  chunk: Bytes;
  proof: Bytes[];
}
export interface ChunkFetchingResponse {
  res: ChunkResponse | null;
}
export function ChunkFetchingResponse(s: Scale): ChunkFetchingResponse {
  return {
    res: s.enum({
      Some: [0, () => ({
        chunk: s.bytes(),
        proof: s.list(() => s.bytes()),
      })],
      None: [1, () => null],
    }).Some ?? null,
  };
}
