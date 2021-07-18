import { DiceRoll } from '../dice';

export function unparseDiceRoll(roll: DiceRoll) {
  let base = `${roll.count}d${roll.faces}`;

  if (roll.offset && roll.offset > 0) base += ` + ${roll.offset}`;
  if (roll.offset && roll.offset < 0) base += ` - ${Math.abs(roll.offset)}`;
  if (roll.threshold) base += ` ${roll.threshold.op} ${roll.threshold.value}`;

  return base;
}
