import { expectEof1 } from "../../drain.ts";
import { Conn } from "../../half.ts";
import { Role } from "../Role.ts";
import { Scale, scaleFrames, scaleHandshake } from "../scale.ts";
import { ValidationProtocol } from "./ValidationProtocol.ts";
import { WireMessage } from "./WireMessage.ts";

export async function* validation(conn: Conn) {
  const handshake = (s: Scale) => s.u8() as Role;
  const h = await scaleHandshake(conn, handshake);
  if (h === null) {
    return;
  }
  if (h[0] !== 4 || h[1] !== 4) return;
  yield* scaleFrames(conn[0], WireMessage(ValidationProtocol));
  await expectEof1(conn[1]);
}
validation.PROTOCOL = /^\/[^/]+\/validation\/1$/;
