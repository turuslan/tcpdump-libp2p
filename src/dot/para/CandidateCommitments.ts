import { Bytes } from "../../bytes.ts";
import { H256 } from "../../h256.ts";
import { Scale } from "../scale.ts";
import { OutboundHrmpMessage } from "./OutboundHrmpMessage.ts";

export interface CandidateCommitments {
  upward_messages: Bytes[];
  horizontal_messages: OutboundHrmpMessage[];
  new_validation_code: Bytes | null;
  head_data: Bytes;
  processed_downward_messages: number;
  hrmp_watermark: number;
  hash: H256;
}
export function CandidateCommitments(s: Scale): CandidateCommitments {
  const { o } = s;
  return {
    upward_messages: s.list(() => s.bytes()),
    horizontal_messages: s.list(() => OutboundHrmpMessage(s)),
    new_validation_code: s.opt(() => s.bytes()),
    head_data: s.bytes(),
    processed_downward_messages: s.u32(),
    hrmp_watermark: s.u32(),
    hash: H256.blake(s.a.subarray(o, s.o)),
  };
}
