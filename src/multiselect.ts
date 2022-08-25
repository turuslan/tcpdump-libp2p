import { Conn, HalfConn } from "./half.ts";
import { toUtf } from "./utf.ts";

const MULTISTREAM = "/multistream/1.0.0";

async function read1(conn: HalfConn) {
  const a = new Uint8Array(128);
  if (await conn.peek(a.subarray(0, 1)) === null) {
    return null;
  }
  const n = a[0];
  if (n >= a.length) {
    throw new Error();
  }
  if (!await conn.read(a.subarray(0, 1 + n))) {
    return null;
  }
  if (a[n] !== 0x0a) {
    throw new Error();
  }
  return toUtf(a.subarray(1, n));
}

async function read2(
  conn: Conn,
): Promise<[protocol: string, ok: boolean] | null> {
  const protocol1 = await read1(conn[1]);
  if (protocol1 === null) {
    return null;
  }
  const protocol0 = await read1(conn[0]);
  if (protocol0 === null) {
    return null;
  }
  if (protocol0 === protocol1) {
    return [protocol0, true];
  }
  if (protocol1 === "na") {
    return [protocol0, false];
  }
  throw new Error();
}

export type Multiselect = [protocol: string | null, na: string[]];

export async function multiselect(
  conn: Conn,
): Promise<Multiselect> {
  const na: string[] = [];
  while (true) {
    const r = await read2(conn);
    if (r === null) {
      return [null, na];
    }
    const [protocol, ok] = r;
    if (protocol === MULTISTREAM) {
      if (!ok) {
        throw new Error();
      }
      continue;
    }
    if (ok) {
      return [protocol, na];
    }
    na.push(protocol);
  }
}
