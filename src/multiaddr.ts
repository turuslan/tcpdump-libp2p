import { decode32 } from "https://deno.land/x/varint@v2.0.0/varint.ts";
import { startsWith } from "https://deno.land/std@0.167.0/bytes/mod.ts";
import { PeerId } from "./PeerId.ts";

enum Code {
  IP4 = 4,
  IP6 = 41,
  TCP = 6,
  P2P = 421,
  WS = 477,
}

const IP6 = Uint8Array.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);

function u16(a: Uint8Array, o: number) {
  return (a[o] << 8) | a[o + 1];
}

export function fromMultiaddr(a: Uint8Array) {
  let s = "";
  let o = 0, c = 0;
  while (o < a.length) {
    [c, o] = decode32(a, o);
    if (c === Code.IP4) {
      const v = 4;
      if (o + v > a.length) {
        throw new Error();
      }
      s += `/ip4/${a[o]}.${a[o + 1]}.${a[o + 2]}.${a[o + 3]}`;
      o += v;
    } else if (c === Code.IP6) {
      const v = 16;
      if (o + v > a.length) {
        throw new Error();
      }
      if (!startsWith(a.subarray(o), IP6)) {
        throw new Error();
      }
      s += "/ip6/::1";
      o += v;
    } else if (c === Code.TCP) {
      const v = 2;
      if (o + v > a.length) {
        throw new Error();
      }
      s += "/tcp/" + u16(a, o);
      o += v;
    } else if (c === Code.WS) {
      s += "/ws";
      if (o < a.length) {
        throw new Error();
      }
    } else if (c === Code.P2P) {
      let v = 0;
      [v, o] = decode32(a, o);
      if (o + v > a.length) {
        throw new Error();
      }
      s += "/p2p/" + new PeerId(a.subarray(o, o + v));
      o += v;
    } else {
      throw new Error();
    }
  }
  return s;
}
