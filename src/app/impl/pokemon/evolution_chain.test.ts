import { build_evolution_tree as tree } from './evolution_chain';

function root(name: string, id: number) {
  return { name, id };
}

function child(parent: { id: number }, name: string, id: number) {
  return { name, id, parent_id: parent.id };
}

describe('permutations', () => {
  it('depth = 1, breadth = 1', () => {
    const FARFETCHD = root('farfetchd', 1);
    const FINAL = [[FARFETCHD]];

    expect(tree([FARFETCHD])).toEqual(FINAL);
  });

  it('depth = 2, breadth = 1', () => {
    const KRICKETOT = root('kricketot', 1);
    const KRICKETUNE = child(KRICKETOT, 'kricketune', 2);
    const FINAL = [[KRICKETOT, KRICKETUNE]];

    expect(tree([KRICKETOT, KRICKETUNE])).toEqual(FINAL);
  });

  it('depth = 3, breadth = 1', () => {
    const BULBASAUR = root('bulbasaur', 1);
    const IVYSAUR = child(BULBASAUR, 'ivysaur', 2);
    const VENUSAUR = child(IVYSAUR, 'venusaur', 3);
    const FINAL = [[BULBASAUR, IVYSAUR, VENUSAUR]];

    expect(tree([BULBASAUR, IVYSAUR, VENUSAUR])).toEqual(FINAL);
  });

  it('depth = 2, breadth = 2 (branches after 1)', () => {
    const SNORUNT = root('snorunt', 1);
    const GLALIE = child(SNORUNT, 'glalie', 2);
    const FROSLASS = child(SNORUNT, 'froslass', 3);
    const FINAL = [
      [SNORUNT, GLALIE],
      [SNORUNT, FROSLASS],
    ];

    expect(tree([SNORUNT, GLALIE, FROSLASS])).toEqual(FINAL);
  });

  it('depth = 2, breadth = 3 (branches after 1)', () => {
    const TYROGUE = root('tyrogue', 1);
    const LEE = child(TYROGUE, 'hitmonlee', 2);
    const CHAN = child(TYROGUE, 'hitmonchan', 3);
    const TOP = child(TYROGUE, 'hitmontop', 4);

    const NODES = [TYROGUE, LEE, CHAN, TOP];
    const FINAL = [
      [TYROGUE, LEE],
      [TYROGUE, CHAN],
      [TYROGUE, TOP],
    ];

    expect(tree(NODES)).toEqual(FINAL);
  });

  it('depth = 3, breadth = 2 (branches after 1)', () => {
    const WURMPLE = root('wurmple', 1);
    const SILCOON = child(WURMPLE, 'silcoon', 2);
    const CASCOON = child(WURMPLE, 'cascoon', 3);
    const BEAUTIFLY = child(SILCOON, 'beautifly', 4);
    const DUSTOX = child(CASCOON, 'dustox', 5);

    const NODES = [WURMPLE, SILCOON, CASCOON, BEAUTIFLY, DUSTOX];
    const FINAL = [
      [WURMPLE, SILCOON, BEAUTIFLY],
      [WURMPLE, CASCOON, DUSTOX],
    ];

    expect(tree(NODES)).toEqual(FINAL);
  });

  it('depth = 2, breadth = 8 (branches after 1)', () => {
    const EEVEE = root('eevee', 1);
    const EEVEELUTION_NAMES = [
      'vaporeon',
      'jolteon',
      'flareon',
      'espeon',
      'umbreon',
      'leafeon',
      'glaceaon',
      'sylveon',
    ];

    const EEVEELUTIONS = EEVEELUTION_NAMES.map((n, i) => child(EEVEE, n, i + 2));
    const NODES = [EEVEE, ...EEVEELUTIONS];
    const FINAL = EEVEELUTIONS.map((n) => [EEVEE, n]);

    expect(tree(NODES)).toEqual(FINAL);
  });

  it('depth = 3, breadth = 2 (branches after 2)', () => {
    const RALTS = root('ralts', 1);
    const KIRLIA = child(RALTS, 'kirlia', 2);
    const GARDEVOIR = child(KIRLIA, 'gardevoir', 3);
    const GALLADE = child(KIRLIA, 'gallade', 4);

    const NODES = [RALTS, KIRLIA, GARDEVOIR, GALLADE];
    const FINAL = [
      [RALTS, KIRLIA, GARDEVOIR],
      [RALTS, KIRLIA, GALLADE],
    ];

    expect(tree(NODES)).toEqual(FINAL);
  });
});
