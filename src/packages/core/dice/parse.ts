import { clamp } from 'support/number';
import { DEFAULT_DICE_ROLL, DiceRoll, DiceThresholdOp } from './dice';
import { matchDiceNotation, stripDiceNotationSpaces } from './parse/notation';
import { diceParseError } from './parse/parse_error';

export function parseDiceRoll(roll: string): DiceRoll {
  roll = stripDiceNotationSpaces(roll);

  if (roll.length === 0) {
    return DEFAULT_DICE_ROLL;
  }

  const match = matchDiceNotation(roll);

  if (!match) {
    return diceParseError(roll);
  }

  const groups = match.groups!;
  const result: Partial<DiceRoll> = {};

  function set<K extends keyof DiceRoll>(key: K, value: DiceRoll[K]) {
    result[key] = value;
  }

  set('count', clamp(+(groups.count ?? 1), 1, 100));
  set('faces', clamp(+(groups.faces ?? 6), 1, 100));

  if (groups.offset) {
    set('offset', clamp(+groups.offset, -100, 100));
  }

  if (groups.tOp) {
    set('threshold', { op: groups.tOp as DiceThresholdOp, value: +groups.tValue });
  }

  return result as DiceRoll;
}

export { unparseDiceRoll } from './parse/unparse';
