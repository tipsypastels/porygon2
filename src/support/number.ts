/**
 * Clamps `num` to >=min and <=max.
 */
export function clamp(num: number, min: number, max: number) {
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

const INT = /^\d+$/;

/**
 * Is `string` an integer string?
 */
export function isIntLike(string: string) {
  return !!INT.exec(string);
}
