import { Conn } from "../../half.ts";
import { scaleReqRes } from "../scale.ts";
import { CollationFetchingRequest } from "./CollationFetchingRequest.ts";
import { CollationFetchingResponse } from "./CollationFetchingResponse.ts";

export async function reqCollation(conn: Conn) {
  return await scaleReqRes(
    conn,
    CollationFetchingRequest,
    CollationFetchingResponse,
  );
}
reqCollation.PROTOCOL = /^\/[^/]+\/req_collation\/1$/;
