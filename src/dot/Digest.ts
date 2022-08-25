import { Bytes } from "../bytes.ts";
import { Enum } from "../enum.ts";
import { toUtf } from "../utf.ts";
import { Scale } from "./scale.ts";

interface _Digest {
  engine: string;
  data: Bytes;
}
function _Digest(s: Scale): _Digest {
  return {
    engine: toUtf(s._blob(4)),
    data: s.bytes(),
  };
}

export type Digest = Enum<{
  Consensus: _Digest;
  Seal: _Digest;
  PreRuntime: _Digest;
}>;
export function Digest(s: Scale): Digest {
  return s.enum({
    Consensus: [4, () => _Digest(s)],
    Seal: [5, () => _Digest(s)],
    PreRuntime: [6, () => _Digest(s)],
  });
}
