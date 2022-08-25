import { Scale } from "../scale.ts";
import { CollatorSignature } from "./CollatorSignature.ts";

export interface Signed<T> {
  payload: T;
  validator_index: number;
  sig: CollatorSignature;
}
export function Signed<T>(
  f: (s: Scale) => T,
): (s: Scale) => Signed<T> {
  return (s) => ({
    payload: f(s),
    validator_index: s.u32(),
    sig: CollatorSignature.scale(s),
    [Symbol.for("Deno.customInspect")](
      inspect: typeof Deno.inspect,
      options: Deno.InspectOptions,
    ) {
      return `Signed(${this.validator_index} ${
        inspect(this.payload, options)
      })`;
    },
  });
}
