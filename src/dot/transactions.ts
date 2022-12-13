import { expectEof1 } from "../drain.ts";
import { Conn } from "../half.ts";
import { Role } from "./Role.ts";
import { Scale, scaleFrames, scaleHandshake } from "./scale.ts";

export async function* transactions(conn: Conn) {
  const handshake = (s: Scale) => s.a.length ? s.u8() as Role : null;
  const h = await scaleHandshake(conn, handshake);
  if (h === null) {
    return;
  }
  for await (
    const txs of scaleFrames(conn[0], (s) => s.list(() => s.bytes()))
  ) {
    yield* txs;
  }
  await expectEof1(conn[1]);
}

transactions.PROTOCOL = /^\/[^/]+\/transactions\/1$/;
