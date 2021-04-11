import { codeBlock } from 'support/format';
import { Cell, Team } from './constants';

export class Board {
  private map = new Map<Cell, Team>();
  private static lines = [
    [Cell.A1, Cell.A2, Cell.A3],
    [Cell.B1, Cell.B2, Cell.B3],
    [Cell.C1, Cell.C2, Cell.C3],
    [Cell.A1, Cell.B1, Cell.C1],
    [Cell.A2, Cell.B2, Cell.C2],
    [Cell.A3, Cell.B3, Cell.C3],
    [Cell.A1, Cell.B2, Cell.C3],
    [Cell.A3, Cell.B2, Cell.C1],
  ];

  get state(): BoardState {
    for (const [a, b, c] of Board.lines) {
      const aVal = this.get(a);
      const bVal = this.get(b);
      const cVal = this.get(c);

      if (aVal && aVal === bVal && aVal === cVal) {
        return BoardState.Line;
      }
    }

    if (this.map.size >= 9) {
      return BoardState.Full;
    }

    return BoardState.Available;
  }

  get(cell: Cell) {
    return this.map.get(cell);
  }

  isFree(cell: Cell) {
    return !this.map.has(cell);
  }

  fill(cell: Cell, team: Team) {
    if (this.map.has(cell)) {
      throw new Error(`${cell} is already filled!`);
    }

    this.map.set(cell, team);
  }

  toString() {
    let buffer = '+---+---+---+---+\n|   | A | B | C |\n+---+---+---+---+\n';

    for (const row of [1, 2, 3]) {
      buffer += `| ${row} | `;

      for (const col of ['A', 'B', 'C']) {
        const at = this.at(Cell[(col + row) as 'A1']);
        buffer += `${at} | `;
      }

      buffer += '\n';
    }

    buffer += '+---+---+---+---+';
    return codeBlock(buffer);
  }

  private at(cell: Cell) {
    return this.map.get(cell)?.toUpperCase() ?? ' ';
  }
}

export enum BoardState {
  Available,
  Line,
  Full,
}
