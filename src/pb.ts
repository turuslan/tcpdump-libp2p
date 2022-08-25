import { decode32 } from "https://deno.land/x/varint@v2.0.0/varint.ts";
import { toUtf } from "./utf.ts";

export class Pb1 {
  constructor(public v: number | Uint8Array) {}
  get b() {
    if (!(this.v instanceof Uint8Array)) {
      throw new Error();
    }
    return this.v;
  }
  get i() {
    if (this.v instanceof Uint8Array) {
      throw new Error();
    }
    return this.v;
  }
  get m() {
    return new Pb(this.b);
  }
  get s() {
    return toUtf(this.b);
  }
}

export class Pb {
  m = new Map<number, Pb1[]>();
  constructor(a: Uint8Array) {
    let o = 0;
    let v0 = 0, v1 = 0;
    while (o < a.length) {
      [v0, o] = decode32(a, o);
      const t = v0 & 7, i = v0 >> 3;
      if (t !== 0 && t !== 2) {
        throw new Error();
      }
      [v1, o] = decode32(a, o);
      let l = this.m.get(i);
      if (l === undefined) {
        this.m.set(i, l = []);
      }
      if (t === 0) {
        l.push(new Pb1(v1));
      } else {
        if (o + v1 > a.length) {
          throw new Error();
        }
        l.push(new Pb1(a.subarray(o, o + v1)));
        o += v1;
      }
    }
  }
  list<T>(i: number, f: (x: Pb1) => T): T[] {
    return this.m.get(i)?.map(f) ?? [];
  }
  one(i: number): Pb1 {
    const l = this.m.get(i);
    if (l?.length !== 1) {
      throw new Error(`${i}`);
    }
    return l[0];
  }
  may<T>(i: number, f: (x: Pb1) => T): T | null {
    const l = this.m.get(i);
    if (l === undefined) {
      return null;
    }
    if (l.length !== 1) {
      throw new Error(`${i}`);
    }
    return f(l[0]);
  }
  map<
    T extends {
      [k: string]: [number, "N" | "1" | "?", (x: Pb1) => any];
    },
  >(t: T): {
    [K in keyof T]: T[K][1] extends "N" ? ReturnType<T[K][2]>[]
      : T[K][1] extends "1" ? ReturnType<T[K][2]>
      : T[K][1] extends "?" ? ReturnType<T[K][2]> | null
      : never;
  } {
    const r: any = {};
    const e = new Set<number>();
    for (const k in t) {
      const [i, c, f] = t[k];
      if (c === "N") {
        r[k] = this.list(i, f);
      } else if (c === "1") {
        r[k] = f(this.one(i));
      } else if (c === "?") {
        r[k] = this.may(i, f);
      } else {
        throw new Error();
      }
      e.add(i);
    }
    for (const i of this.m.keys()) {
      if (!e.has(i)) {
        throw new Error(`${i}`);
      }
    }
    return r;
  }
}
