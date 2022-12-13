import { expectEof1 } from "../../drain.ts";
import { Conn } from "../../half.ts";
import { Role } from "../Role.ts";
import { Scale, scaleFrames, scaleHandshake } from "../scale.ts";
import { CollatorProtocolMessage } from "./CollatorProtocolMessage.ts";
import { WireMessage } from "./WireMessage.ts";

export async function* collation(conn: Conn) {
  const handshake = (s: Scale) => s.u8() as Role;
  const h = await scaleHandshake(conn, handshake);
  if (h === null) {
    return;
  }
  yield* scaleFrames(conn[0], WireMessage(CollatorProtocolMessage));
  await expectEof1(conn[1]);
}
collation.PROTOCOL = /^\/[^/]+\/collation\/1$/;
