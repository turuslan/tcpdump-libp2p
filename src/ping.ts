import { drain } from "./drain.ts";
import { Conn } from "./half.ts";

export async function ping(conn: Conn) {
  await drain(conn, false);
}
ping.PROTOCOL = "/ipfs/ping/1.0.0";
