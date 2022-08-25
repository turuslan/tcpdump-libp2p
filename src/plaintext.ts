import { equals } from "https://deno.land/std@0.153.0/bytes/mod.ts";
import { Conn, HalfConn } from "./half.ts";
import { PeerId } from "./PeerId.ts";

export const PLAINTEXT = "/plaintext/2.0.0";

async function read1(conn: HalfConn) {
  const a = new Uint8Array(79);
  if (!await conn.read(a)) {
    return null!;
  }
  if (a[0] !== 0x4e || a[1] !== 0x0a || a[2] !== 0x26) {
    throw new Error();
  }
  if (a[41] !== 0x12 || a[42] !== 0x24) {
    throw new Error();
  }
  if (!equals(a.subarray(5, 41), a.subarray(43))) {
    throw new Error();
  }
  return new PeerId(a.subarray(3, 41));
}

export async function plaintext(conn: Conn) {
  const peer = await Promise.all([read1(conn[0]), read1(conn[1])]);
  if (peer[0] === null || peer[1] === null) {
    return null!;
  }
  return peer;
}
