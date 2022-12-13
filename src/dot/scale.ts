import { Bits } from "../bits.ts";
import { Bytes } from "../bytes.ts";
import { Enum } from "../enum.ts";
import { H256 } from "../h256.ts";
import { Conn, HalfConn } from "../half.ts";
import {
  varintFrame,
  varintFrames,
  varintHandshake,
  varintReqRes,
} from "../varint.ts";

const U = BigInt(Number.MAX_SAFE_INTEGER);

export class Scale {
  o = 0;
  d: DataView;
  constructor(public a: Uint8Array) {
    this.d = new DataView(a.buffer, a.byteOffset, a.length);
  }
  _u8() {
    if (this.o >= this.a.length) {
      throw new Error();
    }
    return this.a[this.o];
  }
  endf<T>(f: (s: Scale) => T) {
    return this.end(f(this));
  }
  end<T>(t: T) {
    if (this.o < this.a.length) {
      throw new Error();
    }
    return t;
  }
  big() {
    const m = this._u8() & 3;
    if (m === 0) {
      return BigInt(this.u8() >> 2);
    }
    if (m === 1) {
      return BigInt(this.u16() >> 2);
    }
    if (m === 2) {
      return BigInt(this.u32() >> 2);
    }
    throw new Error("TODO");
  }
  u() {
    const x = this.big();
    if (x > U) {
      throw new Error();
    }
    return Number(x);
  }
  u8() {
    return this.a[this._n(1)];
  }
  u16() {
    return this.d.getUint16(this._n(2), true);
  }
  u32() {
    return this.d.getUint32(this._n(4), true);
  }
  _u64() {
    return this.d.getBigUint64(this._n(8), true);
  }
  u64() {
    const x = this._u64();
    if (x > U) {
      throw new Error(`${x}`);
    }
    return Number(x);
  }
  h256() {
    return new H256(this._blob(32));
  }
  bytes() {
    return new Bytes(this._bytes());
  }
  bits() {
    const n = this.u();
    return new Bits(n, this._blob((n + 7) >> 3));
  }
  list<T>(f: () => T) {
    const n = this.u();
    const a: T[] = [];
    for (let i = 0; i < n; ++i) {
      a.push(f());
    }
    return a;
  }
  opt<T>(f: () => T) {
    const n = this.u8();
    if (n === 0) {
      return null;
    }
    if (n !== 1) {
      throw new Error();
    }
    return f();
  }
  enum<T extends { [k: string]: [number, () => any] }>(
    t: T,
  ): Enum<{ [K in keyof T]: ReturnType<T[K][1]> }> {
    const i = this.u8();
    for (const k in t) {
      const [j, f] = t[k];
      if (j >= 256) {
        throw new Error();
      }
      if (i === j) {
        return Enum(k as any, f());
      }
    }
    throw new Error(`${i}`);
  }
  _blob(n: number) {
    const o = this._n(n);
    return this.a.subarray(o, o + n);
  }
  _bytes() {
    return this._blob(this.u());
  }
  _n(n: number) {
    const { o } = this;
    if (o + n > this.a.length) {
      throw new Error();
    }
    this.o += n;
    return o;
  }
}

function _frame<T>(a: Uint8Array, f: (s: Scale) => T) {
  return new Scale(a).endf(f);
}

export async function scaleFrame<T>(
  conn: HalfConn,
  f: (s: Scale) => T,
): Promise<T | null> {
  const a = await varintFrame(conn);
  return a && _frame(a, f);
}

export async function scaleHandshake<T>(
  conn: Conn,
  f: (s: Scale) => T,
): Promise<[T, T] | null> {
  const a = await varintHandshake(conn);
  return a && [_frame(a[0], f), _frame(a[1], f)];
}

export async function scaleReqRes<T0, T1>(
  conn: Conn,
  f0: (s: Scale) => T0,
  f1: (s: Scale) => T1,
): Promise<[T0, T1 | null] | null> {
  const a = await varintReqRes(conn);
  return a && [_frame(a[0], f0), a[1] && _frame(a[1], f1)];
}

export async function* scaleFrames<T>(conn: HalfConn, f: (s: Scale) => T) {
  for await (const a of varintFrames(conn)) {
    yield _frame(a, f);
  }
}
