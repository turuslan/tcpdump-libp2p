import { Bytes } from "../../bytes.ts";
import { Scale } from "../scale.ts";

export interface OutboundHrmpMessage {
  recipient: number;
  data: Bytes;
}
export function OutboundHrmpMessage(s: Scale): OutboundHrmpMessage {
  return {
    recipient: s.u32(),
    data: s.bytes(),
  };
}
