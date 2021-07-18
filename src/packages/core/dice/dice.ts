import { RequiredKey } from 'support/type';

export interface DiceRoll {
  faces: number;
  count: number;
  offset?: number;
  threshold?: DiceThreshold;
}

export type DiceRollWithRequiredThreshold = RequiredKey<DiceRoll, 'threshold'>;

export const DEFAULT_DICE_ROLL: DiceRoll = {
  faces: 6,
  count: 1,
};

export interface DiceThreshold {
  op: DiceThresholdOp;
  value: number;
}

export enum DiceThresholdOp {
  Eq = '=',
  Gt = '>',
  Lt = '<',
  Ge = '>=',
  Le = '<=',
}

export function diceThresholdPasses({ op, value }: DiceThreshold, roll: number) {
  // prettier-ignore
  switch (op) {
    case DiceThresholdOp.Eq: return roll === value;
    case DiceThresholdOp.Gt: return roll > value;
    case DiceThresholdOp.Lt: return roll < value;
    case DiceThresholdOp.Ge: return roll >= value;
    case DiceThresholdOp.Le: return roll <= value;
  }
}
