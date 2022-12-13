import { equals } from "https://deno.land/std@0.167.0/bytes/equals.ts";
import { BufReader } from "https://deno.land/std@0.167.0/io/mod.ts";
import { Conn } from "./half.ts";
import { OnConn } from "./log.ts";
import { multiselect } from "./multiselect.ts";
import { PeerId2 } from "./PeerId.ts";
import { PLAINTEXT, plaintext } from "./plaintext.ts";
import { _loops, YAMUX, YamuxN } from "./yamux.ts";

export enum TcpType {
  OPEN,
  CLOSE,
  DATA0,
  DATA1,
}
export class Tcp {
  conn = new Conn();
  peer: PeerId2 = null!;
  yamuxn: YamuxN = null!;
  _loop: Promise<void>;

  constructor(public tcpn: TcpN, public id: number) {
    this._loop = this.loop();
  }
  async multiselect(s: string) {
    const p = await multiselect(this.conn);
    if (p[1].includes(s)) {
      throw new Error();
    }
    if (p[0] === null) {
      return false;
    }
    if (p[0] !== s) {
      throw new Error();
    }
    return true;
  }
  async loop() {
    if (!await this.multiselect(PLAINTEXT)) {
      return;
    }
    this.peer = await plaintext(this.conn);
    if (this.peer === null) {
      return;
    }
    if (!await this.multiselect(YAMUX)) {
      return;
    }
    const on_stream = this.tcpn.on_conn(
      this.conn.time,
      this.id,
      this.peer,
      this._loop.then(() => this.conn.time),
    );
    this.yamuxn = new YamuxN(this, on_stream);
    await this.yamuxn.loop();
  }
}
export class TcpN {
  tcps = new Map<number, Tcp>();
  constructor(public on_conn: OnConn) {}
  write(time: number, id: number, type: TcpType, data: Uint8Array) {
    if (type === TcpType.OPEN) {
      const tcp = new Tcp(this, id);
      this.tcps.set(id, tcp);
      tcp._loop.then(() => this.tcps.delete(id));
      return;
    }
    const tcp = this.tcps.get(id);
    if (tcp === undefined) {
      throw new Error();
    }
    if (type === TcpType.CLOSE) {
      tcp.conn.close(time);
      return;
    }
    const side = type === TcpType.DATA0 ? 0 : 1;
    tcp.conn.write(time, side, data.slice());
  }
  static async *_loop(
    r: BufReader,
  ): AsyncGenerator<[number, number, TcpType, Uint8Array]> {
    const item = new Uint32Array(4);
    const _data = new Uint8Array(64 << 10);
    let _time = 0;
    while (true) {
      if (await r.readFull(new Uint8Array(item.buffer)) === null) {
        break;
      }
      const [timel, timeh, id, type_size] = item;
      const time = 0x100000000 * timeh + timel;
      if (_time > time) {
        throw new Error();
      }
      _time = time;
      const size = type_size >> 2;
      if (size > _data.length) {
        throw new Error();
      }
      const data = _data.subarray(0, size);
      if (await r.readFull(data) === null) {
        break;
      }
      yield [time, id, type_size & 3, data];
    }
  }
  static async *_file(path: string) {
    const file = await Deno.open(path, { read: true });
    const r = new BufReader(file);
    const magic = await r.peek(4);
    if (magic !== null) {
      if (equals(magic, Uint8Array.of(0xd4, 0xc3, 0xb2, 0xa1))) {
        throw new Error("TODO: pcap");
      }
    }
    yield* this._loop(r);
  }
  async file(path: string) {
    let _time = 0;
    for await (const x of TcpN._file(path)) {
      _time = x[0];
      this.write(...x);
    }
    await _loops(this.tcps, _time);
  }
}
