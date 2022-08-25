import { Scale } from "../scale.ts";
import { AssignmentCertKind } from "./AssignmentCertKind.ts";
import { VRFOutput } from "./VRFOutput.ts";
import { VRFProof } from "./VRFProof.ts";

export interface AssignmentCert {
  kind: AssignmentCertKind;
  vrf: [VRFOutput, VRFProof];
}
export function AssignmentCert(s: Scale): AssignmentCert {
  return {
    kind: AssignmentCertKind(s),
    vrf: [VRFOutput.scale(s), VRFProof.scale(s)],
  };
}
