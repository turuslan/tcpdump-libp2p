import { Bytes } from "./bytes.ts";
import { Conn } from "./half.ts";
import { fromMultiaddr } from "./multiaddr.ts";
import { Pb1 } from "./pb.ts";
import { PeerId } from "./PeerId.ts";
import { tuple } from "./tuple.ts";
import { varintReqRes } from "./varint.ts";

enum Type {
  PUT_VALUE,
  GET_VALUE,
  ADD_PROVIDER,
  GET_PROVIDERS,
  FIND_NODE,
  PING,
}

enum Status {
  NOT_CONNECTED,
  CONNECTED,
  CAN_CONNECT,
  CANNOT_CONNECT,
}

interface Peer {
  id: PeerId;
  addrs: string[];
  status: Status | null;
}
function Peer(pb: Pb1): Peer {
  return pb.m.map({
    id: [1, "1", (x) => new PeerId(x.b)],
    addrs: [2, "N", (x) => fromMultiaddr(x.b)],
    status: [3, "?", (x) => x.i],
  });
}

interface Record {
  key: Bytes;
  value: Bytes | null;
}
function Record(pb: Pb1): Record {
  return pb.m.map({
    key: [1, "1", (x) => new Bytes(x.b)],
    value: [2, "?", (x) => new Bytes(x.b)],
    _5: [5, "?", (x) => new Bytes(x.b)],
    _666: [666, "?", (x) => new Bytes(x.b)],
    _777: [777, "?", (x) => x.i],
  });
}

interface Message {
  type: Type | null;
  key: Bytes | null;
  record: Record | null;
  closer: Peer[];
  provider: Peer[];
}
function Message(pb: Pb1): Message {
  return pb.m.map({
    type: [1, "?", (x) => x.i],
    key: [2, "?", (x) => new Bytes(x.b)],
    record: [3, "?", Record],
    _10: [10, "?", (x) => x.i],
    closer: [8, "N", Peer],
    provider: [9, "N", Peer],
  });
}

export async function kademlia(conn: Conn) {
  const rr = await varintReqRes(conn);
  if (rr === null) {
    return null;
  }
  const req = Message(new Pb1(rr[0]));
  const res = rr[1] && Message(new Pb1(rr[1]));
  return tuple(req, res);
}
kademlia.PROTOCOL = /^\/(dot)\/kad$/;
