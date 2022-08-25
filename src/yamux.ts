import { drain } from "./drain.ts";
import { Conn } from "./half.ts";
import { OnStream } from "./log.ts";
import { multiselect } from "./multiselect.ts";
import { Tcp } from "./tcp.ts";

export const YAMUX = "/yamux/1.0.0";

export async function _loops(
  map: Map<number, { _loop: Promise<void>; conn: Conn }>,
  time: number,
) {
  const ps: Promise<void>[] = [];
  for (const x of map.values()) {
    ps.push(x._loop);
    x.conn.close(time);
  }
  await Promise.all(ps);
}

enum YamuxType {
  DATA,
  WINDOW_UPDATE,
  PING,
  GO_AWAY,
}
enum YamuxFlag {
  SYN = 1,
  ACK = 2,
  FIN = 4,
  RST = 8,
}
class YamuxFrame {
  type: YamuxType;
  flags: YamuxFlag;
  id: number;
  _size: number;
  static SIZE = 12;
  constructor(a: Uint8Array) {
    if (a.length !== YamuxFrame.SIZE) {
      throw new Error();
    }
    const d = new DataView(a.buffer, a.byteOffset, a.length);
    if (a[0] !== 0) {
      throw new Error();
    }
    this.type = a[1];
    if (this.type > YamuxType.GO_AWAY) {
      throw new Error();
    }
    this.flags = d.getUint16(2);
    this.id = d.getUint32(4);
    this._size = d.getUint32(8);
  }
  get size() {
    return this.type === YamuxType.DATA ? this._size : 0;
  }
}

class Yamux {
  conn = new Conn();
  _loop: Promise<void>;
  constructor(public yamuxn: YamuxN, public id: number, public side: 0 | 1) {
    this._loop = this.loop();
  }
  async loop() {
    const other = this.side ? 0 : 1;
    const conn = new Conn([this.conn[this.side], this.conn[other]]);
    const protocol = await multiselect(conn);
    const { peer } = this.yamuxn.tcp;
    await this.yamuxn.on_stream?.(
      this.conn[this.side].time,
      this.id,
      [peer[this.side], peer[other]],
      protocol,
      protocol[0] === null ? null! : conn,
    );
    await drain(conn, true);
  }
}
export class YamuxN {
  yamuxs = new Map<number, Yamux>();
  constructor(public tcp: Tcp, public on_stream: OnStream | void) {}
  async _loop(side: 0 | 1) {
    const conn = this.tcp.conn[side];
    const _frame = new Uint8Array(YamuxFrame.SIZE);
    const _data = new Uint8Array(1 << 20);
    while (true) {
      if (!await conn.read(_frame)) {
        break;
      }
      const frame = new YamuxFrame(_frame);
      if (frame.size > _data.length) {
        throw new Error();
      }
      const data = _data.subarray(0, frame.size);
      if (data.length !== 0) {
        if (!await conn.read(data)) {
          break;
        }
      }
      if (frame.flags && (frame.flags & (frame.flags - 1))) {
        throw new Error();
      }
      if (frame.type === YamuxType.WINDOW_UPDATE) {
        continue;
      }
      if (frame.type === YamuxType.PING) {
        continue;
      }
      if (frame.type === YamuxType.GO_AWAY) {
        continue;
      }
      let yamux = this.yamuxs.get(frame.id);
      const syn = frame.flags & YamuxFlag.SYN;
      if (syn || (frame.flags & YamuxFlag.ACK)) {
        if (yamux === undefined) {
          yamux = new Yamux(this, frame.id, side ^ syn ? 0 : 1);
          this.yamuxs.set(frame.id, yamux);
          yamux._loop.then(() => this.yamuxs.delete(frame.id));
        }
      }
      if (yamux === undefined) {
        continue;
      }
      yamux.conn[side].write(conn.time, data.slice());
      if (frame.flags & YamuxFlag.FIN) {
        yamux.conn[side].close(conn.time);
      }
      if (frame.flags & YamuxFlag.RST) {
        yamux.conn.close(conn.time);
      }
    }
  }
  async loop() {
    await Promise.all([this._loop(0), this._loop(1)]);
    await _loops(this.yamuxs, this.tcp.conn.time);
  }
}
