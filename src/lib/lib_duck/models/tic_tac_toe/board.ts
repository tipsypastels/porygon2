import { codeBlock } from 'support/format';
import { Team } from './constants';
import { GamePlayingState, GameTiedState, GameWonState } from './state';

export class Board {
  private map = new Map<string, Team>();
  private static lines = [
    ['A1', 'A2', 'A3'],
    ['B1', 'B2', 'B3'],
    ['C1', 'C2', 'C3'],
    ['A1', 'B1', 'C1'],
    ['A2', 'B2', 'C2'],
    ['A3', 'B3', 'C3'],
    ['A1', 'B2', 'C3'],
    ['A3', 'B2', 'C1'],
  ];

  get(cell: string) {
    return this.map.get(cell);
  }

  isFree(cell: string) {
    return !this.map.has(cell);
  }

  fill(cell: string, team: Team) {
    if (this.map.has(cell)) {
      throw new Error(`${cell} is already filled!`);
    }

    this.map.set(cell, team);

    return this.computeState();
  }

  toString() {
    let buffer = '+---+---+---+---+\n|   | A | B | C |\n+---+---+---+---+\n';

    for (const row of [1, 2, 3]) {
      buffer += `| ${row} | `;

      for (const col of ['A', 'B', 'C']) {
        const at = this.at(col + row);
        buffer += `${at} | `;
      }

      buffer += '\n';
    }

    buffer += '+---+---+---+---+';
    return codeBlock(buffer);
  }

  private at(cell: string) {
    return this.map.get(cell) ?? ' ';
  }

  private computeState() {
    for (const [a, b, c] of this.eachLine()) {
      if (a && a === b && a === c) {
        return GameWonState;
      }
    }

    for (const line of this.eachLine()) {
      // if there's only one player on a given line, it is still in play
      if (this.getEffectivePlayersOnLine(line).size <= 1) {
        return GamePlayingState;
      }
    }

    return GameTiedState;
  }

  private *eachLine() {
    for (const [a, b, c] of Board.lines) {
      const aVal = this.get(a);
      const bVal = this.get(b);
      const cVal = this.get(c);

      yield [aVal, bVal, cVal] as const;
    }
  }

  private getEffectivePlayersOnLine(line: readonly (Team | undefined)[]) {
    const filled = line.filter((x) => x != null);
    const set = new Set(filled);

    return set;
  }
}
