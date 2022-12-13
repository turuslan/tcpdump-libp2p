import { Bytes } from "../bytes.ts";
import { H256 } from "../h256.ts";
import { Conn } from "../half.ts";
import { Pb1 } from "../pb.ts";
import { tuple } from "../tuple.ts";
import { varintReqRes } from "../varint.ts";
import { BlockHeader } from "./BlockHeader.ts";
import { Scale } from "./scale.ts";

export enum Fields {
  HEADER = 1,
  BODY = 1 << 1,
  RECEIPT = 1 << 2,
  MESSAGE_QUEUE = 1 << 3,
  JUSTIFICATION = 1 << 4,
  INDEXED_BODY = 1 << 5,
}

export interface Request {
  fields: Fields;
  from_hash: H256 | null;
  from_num: Bytes | null;
  down: 1 | null;
  max: number | null;
  mj: true | null;
}
function Request(pb: Pb1): Request {
  return pb.m.map({
    fields: [1, "1", (x) => x.i >> 24],
    from_hash: [2, "?", (x) => new H256(x.b)],
    from_num: [3, "?", (x) => new Bytes(x.b)],
    down: [5, "?", (x) => x.i as 1],
    max: [6, "?", (x) => x.i],
    mj: [7, "?", (x) => x.i as unknown as true],
  });
}

export interface BlockData {
  hash: H256;
  header: BlockHeader | null;
  body: Bytes[];
  justification: Bytes|null
  justifications: Bytes|null
}
function BlockData(pb: Pb1): BlockData {
  return pb.m.map({
    hash: [1, "1", (x) => new H256(x.b)],
    header: [2, "?", (x) => new Scale(x.b).endf(BlockHeader)],
    body: [3, "N", (x) => new Bytes(x.b)],
    justification: [6, "?", (x) => new Bytes(x.b)],
    justifications: [8, "?", (x) => new Bytes(x.b)],
  });
}
export interface Response {
  blocks: BlockData[];
}
function Response(pb: Pb1): Response {
  return pb.m.map({
    blocks: [1, "N", BlockData],
  });
}

export async function sync(conn: Conn) {
  const rr = await varintReqRes(conn);
  if (rr === null) {
    return null;
  }
  const req = Request(new Pb1(rr[0]));
  const res = rr[1] && Response(new Pb1(rr[1]));
  return tuple(req, res);
}
sync.PROTOCOL = /^\/[^/]+\/sync\/2$/;
