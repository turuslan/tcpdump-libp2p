export type Enum<T> = { E: keyof T } & T;

function inspect(
  this: Enum<any>,
  inspect: typeof Deno.inspect,
  options: Deno.InspectOptions,
) {
  return `${this.E}(${inspect(this[this.E], options)})`;
}

export function Enum<T extends Enum<any>, E extends Exclude<keyof T, "E">>(
  E: E,
  e: T[E],
): T {
  const r: T = { E, [E]: e } as any;
  Object.defineProperty(r, Symbol.for("Deno.customInspect"), {
    enumerable: false,
    value: inspect,
  });
  return r;
}
Enum.match = <T>(
  e: Enum<T>,
  t: { [E in Exclude<keyof T, "E">]?: (x: T[E]) => void },
) => {
  return t[e.E]?.(e[e.E]);
};
