import { DiceThresholdOp, unparseDiceRoll as unparse } from '..';
const { Eq } = DiceThresholdOp;

describe(unparse, () => {
  it('stringifies count+faces (the required properties)', () => {
    expect(unparse({ count: 1, faces: 6 })).toEqual('1d6');
  });

  it('stringifies positive offset', () => {
    expect(unparse({ count: 1, faces: 6, offset: 4 })).toEqual('1d6 + 4');
  });

  it('stringifies negative offset', () => {
    expect(unparse({ count: 1, faces: 6, offset: -4 })).toEqual('1d6 - 4');
  });

  it('stringifies threshold', () => {
    expect(unparse({ count: 1, faces: 6, threshold: { op: Eq, value: 5 } })).toEqual(
      '1d6 = 5',
    );
  });

  it('stringifies threshold + offset', () => {
    expect(
      unparse({ count: 1, faces: 6, offset: 4, threshold: { op: Eq, value: 5 } }),
    ).toEqual('1d6 + 4 = 5');
  });
});
