import { Conn } from "../../half.ts";
import { scaleReqRes } from "../scale.ts";
import { ChunkFetchingRequest } from "./ChunkFetchingRequest.ts";
import { ChunkFetchingResponse } from "./ChunkFetchingResponse.ts";

export async function reqChunk(conn: Conn) {
  return await scaleReqRes(
    conn,
    ChunkFetchingRequest,
    ChunkFetchingResponse,
  );
}
reqChunk.PROTOCOL = "/polkadot/req_chunk/1";
