import { Conn } from "./half.ts";
import { Multiselect } from "./multiselect.ts";
import { PeerId2 } from "./PeerId.ts";

export type OnStream = (
  time: number,
  id: number,
  peer: PeerId2,
  protocol: Multiselect,
  conn: Conn,
) => Promise<void> | void;

export type OnConn = (
  time: number,
  id: number,
  peer: PeerId2,
  loop: Promise<number>,
) => OnStream | void;
