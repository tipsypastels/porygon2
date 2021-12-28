import { Table } from 'console-table-printer';
import { Maybe } from 'support/type';

// this is why you export types with your package :/
type Row = Record<string, any>;
type Params = Exclude<ConstructorParameters<typeof Table>[0], Maybe<string[]>>;
type Layout = NonNullable<Params['columns']>;

export function print_table(layout: Layout, rows: Row[]) {
  const table = new Table({ columns: layout });
  table.addRows(rows);
  table.printTable();
}
