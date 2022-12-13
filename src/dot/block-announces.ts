import { expectEof1 } from "../drain.ts";
import { H256 } from "../h256.ts";
import { Conn } from "../half.ts";
import { toHex } from "../hex.ts";
import { BlockHeader } from "./BlockHeader.ts";
import { Role } from "./Role.ts";
import { Scale, scaleFrames, scaleHandshake } from "./scale.ts";

interface Status {
  roles: Role;
  best_number: number;
  best_hash: H256;
  genesis_hash: H256;
}
function Status(s: Scale): Status {
  return s.end({
    roles: s.u8(),
    best_number: s.u32(),
    best_hash: s.h256(),
    genesis_hash: s.h256(),
  });
}

export async function* blockAnnounces(conn: Conn) {
  const h = await scaleHandshake(conn, Status);
  if (h === null) {
    return;
  }
  yield* scaleFrames(conn[0], (s) => {
    const block = BlockHeader(s);
    if (s.o < s.a.length) {
      const _type = s.u8();
      const data = s._bytes();
      if (data.length) {
        console.warn(`block announce: data=${toHex(data)}`);
      }
    }
    return block;
  });
  await expectEof1(conn[1]);
}
blockAnnounces.PROTOCOL = /^\/[^/]+\/block-announces\/1$/;
