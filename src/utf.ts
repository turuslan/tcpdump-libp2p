export function toUtf(a: Uint8Array) {
  return new TextDecoder().decode(a);
}

export function fromUtf(s: string) {
  return new TextEncoder().encode(s);
}
