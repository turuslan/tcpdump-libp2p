import { expectEof1 } from "../drain.ts";
import { Enum } from "../enum.ts";
import { H256 } from "../h256.ts";
import { Conn } from "../half.ts";
import { CollatorId } from "./para/CollatorId.ts";
import { CollatorSignature } from "./para/CollatorSignature.ts";
import { Role } from "./Role.ts";
import { scaleFrames, scaleHandshake } from "./scale.ts";
import { Scale } from "./scale.ts";

export interface Block {
  hash: H256;
  num: number;
}
function Block(s: Scale): Block {
  return {
    hash: s.h256(),
    num: s.u32(),
  };
}

export interface RoundSet {
  round: number;
  set: number;
}
function RoundSet(s: Scale): RoundSet {
  return {
    round: s.u64(),
    set: s.u64(),
  };
}

interface SigId {
  sig: CollatorSignature;
  id: CollatorId;
}
function SigId(s: Scale): SigId {
  return {
    sig: CollatorSignature.scale(s),
    id: CollatorId.scale(s),
  };
}

export enum Type {
  Prevote,
  Precommit,
  PrimaryPropose,
}
interface SignedMessage {
  type: Type;
  block: Block;
  sig: SigId;
}
function SignedMessage(s: Scale): SignedMessage {
  const type = s.enum({ 0: [0, () => 0], 1: [1, () => 1], 2: [2, () => 2] });
  return {
    type: type[type.E],
    block: Block(s),
    sig: SigId(s),
  };
}

interface Vote extends RoundSet, SignedMessage {
}
function Vote(s: Scale): Vote {
  return {
    ...RoundSet(s),
    ...SignedMessage(s),
  };
}

interface Commit extends RoundSet {
  block: Block;
  precommits: Block[];
  sigs: SigId[];
}
function Commit(s: Scale): Commit {
  return {
    ...RoundSet(s),
    block: Block(s),
    precommits: s.list(() => Block(s)),
    sigs: s.list(() => SigId(s)),
  };
}

interface Neighbor extends RoundSet {
  final: number;
}
function Neighbor(s: Scale): Neighbor {
  s.enum({ _1: [1, () => {}] });
  return {
    ...RoundSet(s),
    final: s.u32(),
  };
}

type CatchUpRequest = RoundSet;
function CatchUpRequest(s: Scale): CatchUpRequest {
  return RoundSet(s);
}

type CatchUpResponse = unknown;
function CatchUpResponse(s: Scale) {
  throw new Error();
}

export type Message = Enum<{
  Vote: Vote;
  Commit: Commit;
  Neighbor: Neighbor;
  CatchUpReq: CatchUpRequest;
  CatchUpRes: CatchUpResponse;
}>;
function Message(s: Scale): Message {
  return s.enum({
    Vote: [0, () => Vote(s)],
    Commit: [1, () => Commit(s)],
    Neighbor: [2, () => Neighbor(s)],
    CatchUpReq: [3, () => CatchUpRequest(s)],
    CatchUpRes: [4, () => CatchUpResponse(s)],
  });
}

export async function* grandpa(conn: Conn) {
  const handshake = (s: Scale) => s.u8() as Role;
  const h = await scaleHandshake(conn, handshake);
  if (h === null) {
    return;
  }
  yield* scaleFrames(conn[0], Message);
  await expectEof1(conn[1]);
}
grandpa.PROTOCOL = /^\/[^/]+\/grandpa\/1$/;
