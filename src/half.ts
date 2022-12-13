import {
  Deferred,
  deferred,
} from "https://deno.land/std@0.167.0/async/deferred.ts";

export class HalfBuf {
  buffers: [time: number, buf: Uint8Array][] = [];
  index = 0;
  offset = 0;
  size = 0;
  closed = 0;
  _time = 0;

  write(time: number, buffer: Uint8Array) {
    if (buffer.length === 0) {
      return;
    }
    if (this.closed) {
      throw new Error();
    }
    this.buffers.push([time, buffer]);
    this.size += buffer.length;
  }
  close(time: number) {
    if (time === 0) {
      throw new Error();
    }
    if (this.closed === 0) {
      this.closed = time;
    }
  }
  *_read(
    want: number,
  ): Generator<
    { buffer: Uint8Array; time: number; index: number; offset: number }
  > {
    if (want > this.size) {
      throw new Error();
    }
    let { index, offset } = this;
    while (want !== 0) {
      const [time, buffer] = this.buffers[index];
      const buffered = buffer.length - offset;
      const take = buffer.subarray(offset, offset + Math.min(want, buffered));
      offset += take.length;
      if (offset === buffer.length) {
        ++index;
        offset = 0;
      }
      yield {
        buffer: take,
        time,
        index,
        offset,
      };
      want -= take.length;
    }
  }
  peek(out: Uint8Array) {
    let _time = 0;
    for (const { buffer, time } of this._read(out.length)) {
      if (out.length === 0) {
        throw new Error();
      }
      out.set(buffer);
      out = out.subarray(buffer.length);
      _time = time;
    }
    if (out.length !== 0) {
      throw new Error();
    }
    return _time;
  }
  skip(want: number) {
    for (const { buffer, index, offset, time } of this._read(want)) {
      this.size -= buffer.length;
      this.index = index;
      this.offset = offset;
      this._time = time;
    }
  }
  get time() {
    return this.size !== 0 ? this._time : Math.max(this._time, this.closed);
  }
}

export class HalfConn {
  buf = new HalfBuf();
  waiting: [number, Deferred<void>] | null = null;
  write(time: number, buffer: Uint8Array) {
    this.buf.write(time, buffer);
    if (this.waiting !== null) {
      const [want, r] = this.waiting;
      if (this.buf.size >= want) {
        this.waiting = null;
        r.resolve();
      }
    }
  }
  close(time: number) {
    this.buf.close(time);
    if (this.waiting !== null) {
      const r = this.waiting[1];
      this.waiting = null;
      r.resolve();
    }
  }
  async wait(want: number) {
    if (this.waiting !== null) {
      throw new Error();
    }
    if (this.buf.size >= want) {
      return;
    }
    if (this.buf.closed !== 0) {
      return;
    }
    const r = deferred<void>();
    this.waiting = [want, r];
    await r;
  }
  async peek(out: Uint8Array) {
    if (this.buf.size < out.length) {
      await this.wait(out.length);
    }
    if (this.buf.size < out.length) {
      return null;
    }
    return this.buf.peek(out);
  }
  async read(out: Uint8Array) {
    if (await this.peek(out) === null) {
      return false;
    }
    this.buf.skip(out.length);
    return true;
  }
  get time() {
    return this.buf.time;
  }
}

export class Conn {
  constructor(
    public c: [HalfConn, HalfConn] = [new HalfConn(), new HalfConn()],
  ) {}
  get [0]() {
    return this.c[0];
  }
  get [1]() {
    return this.c[1];
  }
  write(time: number, side: 0 | 1, buffer: Uint8Array) {
    this[side].write(time, buffer);
  }
  close(time: number) {
    this[0].close(time);
    this[1].close(time);
  }
  get time() {
    return Math.max(this[0].time, this[1].time);
  }
}
