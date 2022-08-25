import { Conn, HalfConn } from "./half.ts";

async function drain1(conn: HalfConn, peek: boolean) {
  while (conn.buf.closed === 0) {
    await conn.wait(conn.buf.size + 1);
  }
  if (!peek) {
    conn.buf.skip(conn.buf.size);
  }
}

export async function drain(conn: Conn, peek: boolean) {
  await Promise.all([drain1(conn[0], peek), drain1(conn[1], peek)]);
}

export async function expectEof1(conn: HalfConn) {
  await conn.wait(conn.buf.size + 1);
  if (conn.buf.closed === 0) {
    throw new Error();
  }
  if (conn.buf.size !== 0) {
    throw new Error();
  }
}

export async function expectEof(conn: Conn) {
  await Promise.all([expectEof1(conn[0]), expectEof1(conn[1])]);
}
