const COUNT = /(?<count>[1-9][0-9]*)?/;
const FACES = /(?:d(?<faces>[1-9][0-9]*))?/;
const OFFSET = /(?<offset>[+-]\d+)?/;
const BASE = new RegExp(`(?:${combine(COUNT, FACES, OFFSET)})?`);

const THRESHOLD_OP = /(?<tOp>=|!=|>|<|>=|<=)/;
const THRESHOLD_VALUE = /(?<tValue>\d+)/;
const THRESHOLD = new RegExp(`(?:${combine(THRESHOLD_OP, THRESHOLD_VALUE)})?`);

const FULL = new RegExp(`^${combine(BASE, THRESHOLD)}$`);

function combine(...args: RegExp[]) {
  return args.map((r) => r.source).join('');
}

export function matchDiceNotation(roll: string) {
  return FULL.exec(roll);
}

export function stripDiceNotationSpaces(roll: string) {
  return roll.replace(/ /g, '');
}
