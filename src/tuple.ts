export function tuple<T0, T1>(t0: T0, t1: T1): [T0, T1];
export function tuple(...a: any[]): any {
  return a;
}
