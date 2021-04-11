const CELL_REGEX = /^[A-C][1-3]$/;

export function isValidCell(text: string) {
  return CELL_REGEX.exec(text) !== null;
}

export enum Team {
  X = 'x',
  O = 'o',
}
