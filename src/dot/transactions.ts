import { expectEof1 } from "../drain.ts";
import { Conn } from "../half.ts";
import { scaleFrames, scaleHandshake } from "./scale.ts";

export async function* transactions(conn: Conn) {
  const h = await scaleHandshake(conn, () => {});
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

transactions.PROTOCOL = /^\/(dot)\/transactions\/1$/;
