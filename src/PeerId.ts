import {
  decodePlain,
  encodePlain,
} from "https://deno.land/x/base58check@v0.1.4/mod.ts";
import { startsWith } from "https://deno.land/std@0.167.0/bytes/mod.ts";

const PUBKEY = Uint8Array.of(0x08, 0x01, 0x12, 0x20);
const PEERID = Uint8Array.of(0x00, 0x24);

export class PeerId {
  s: string;
  static from(pubkey: Uint8Array) {
    if (!startsWith(pubkey, PUBKEY)) {
      throw new Error();
    }
    return new PeerId(Uint8Array.of(...PEERID, ...pubkey));
  }
  static froms(s: string) {
    return new PeerId(decodePlain(s));
  }
  constructor(public a: Uint8Array) {
    if (a.length !== 38) {
      throw new Error();
    }
    if (!startsWith(a, PEERID)) {
      throw new Error();
    }
    if (!startsWith(a.subarray(PEERID.length), PUBKEY)) {
      throw new Error();
    }
    this.s = encodePlain(a);
  }
  get short() {
    return this.s.slice(-6);
  }
  toString() {
    return this.s;
  }
  [Symbol.for("Deno.customInspect")]() {
    return this.D;
  }
  get D() {
    return `PeerId(${this.s})`;
  }
}

export type PeerId2 = [PeerId, PeerId];
