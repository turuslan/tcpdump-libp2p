import { decode32 } from "https://deno.land/x/varint@v2.0.0/varint.ts";
import { expectEof1 } from "./drain.ts";
import { Conn, HalfConn } from "./half.ts";

export async function varint(conn: HalfConn) {
  const a = new Uint8Array(10);
  for (let i = 0; i < a.length; ++i) {
    const n = i + 1;
    if (await conn.peek(a.subarray(0, n)) === null) {
      return null;
    }
    if (a[i] & 0x80) {
      continue;
    }
    conn.buf.skip(n);
    return decode32(a.subarray(0, n))[0];
  }
  throw new Error();
}

export async function varintFrame(conn: HalfConn) {
  const n = await varint(conn);
  if (n === null) {
    return null!;
  }
  const a = new Uint8Array(n);
  if (!await conn.read(a)) {
    return null!;
  }
  return a;
}

export async function* varintFrames(conn: HalfConn) {
  while (true) {
    const frame = await varintFrame(conn);
    if (frame === null) {
      break;
    }
    yield frame;
  }
}

export async function varintHandshake(
  conn: Conn,
): Promise<[Uint8Array, Uint8Array] | null> {
  const a = await Promise.all([varintFrame(conn[0]), varintFrame(conn[1])]);
  if (a[0] === null || a[1] === null) {
    return null;
  }
  return a;
}

export async function varintReqRes(
  conn: Conn,
): Promise<[Uint8Array, Uint8Array | null] | null> {
  const a = await Promise.all([varintFrame(conn[0]), varintFrame(conn[1])]);
  if (a[0] === null) {
    if (a[1] !== null) {
      throw new Error();
    }
    return null;
  }
  await expectEof1(conn[0]);
  if (a[1] !== null) {
    await expectEof1(conn[1]);
  }
  return a;
}
