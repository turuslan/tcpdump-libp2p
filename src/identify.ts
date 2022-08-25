import { expectEof } from "./drain.ts";
import { Conn } from "./half.ts";
import { fromMultiaddr } from "./multiaddr.ts";
import { Pb1 } from "./pb.ts";
import { PeerId } from "./PeerId.ts";
import { varintFrame } from "./varint.ts";

export interface Identify {
  protocol: string;
  agent: string;
  pubkey: PeerId;
  listenAddrs: string[];
  observedAddr: string;
  protocols: string[];
}
function Identify(pb: Pb1): Identify {
  return pb.m.map({
    protocol: [5, "1", (x) => x.s],
    agent: [6, "1", (x) => x.s],
    pubkey: [1, "1", (x) => PeerId.from(x.b)],
    listenAddrs: [2, "N", (x) => fromMultiaddr(x.b)],
    observedAddr: [4, "1", (x) => fromMultiaddr(x.b)],
    protocols: [3, "N", (x) => x.s],
  });
}

export async function identify(conn: Conn) {
  const frame = await varintFrame(conn[1]);
  if (frame === null) {
    return null;
  }
  const id = Identify(new Pb1(frame));
  await expectEof(conn);
  return id;
}
identify.PROTOCOL = "/ipfs/id/1.0.0";
