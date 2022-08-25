import * as HEX from "https://deno.land/std@0.153.0/encoding/hex.ts";
import { fromUtf, toUtf } from "./utf.ts";

export function toHex(a: Uint8Array) {
  return toUtf(HEX.encode(a));
}

export function fromHex(s: string) {
  return HEX.decode(fromUtf(s));
}

export function shortHex(a: Uint8Array) {
  if (a.length <= 4) {
    return toHex(a);
  }
  return toHex(a.subarray(0, 2)) + "…" + toHex(a.subarray(-2));
}

export function toHex0(a: Uint8Array) {
  return "0x" + toHex(a);
}

export function fromHex0(s: string) {
  if (!s.startsWith("0x")) {
    throw new Error();
  }
  return fromHex(s.slice(2));
}
