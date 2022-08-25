import { Enum } from "../../enum.ts";
import { Scale } from "../scale.ts";
import { View } from "./View.ts";

export type WireMessage<T> = Enum<{
  ProtocolMessage: T;
  ViewUpdate: View;
}>;
export function WireMessage<T>(
  f: (s: Scale) => T,
): (s: Scale) => WireMessage<T> {
  return (s) =>
    s.enum({
      ProtocolMessage: [1, () => f(s)],
      ViewUpdate: [2, () => View(s)],
    });
}
