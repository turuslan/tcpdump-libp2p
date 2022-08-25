import { Enum } from "../../enum.ts";
import { Scale } from "../scale.ts";

export type AssignmentCertKind = Enum<{
  RelayVRFModulo: number;
  RelayVRFDelay: number;
}>;
export function AssignmentCertKind(s: Scale): AssignmentCertKind {
  return s.enum({
    RelayVRFModulo: [0, () => s.u32()],
    RelayVRFDelay: [1, () => s.u32()],
  });
}
