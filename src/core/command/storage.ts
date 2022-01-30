import { Controller } from 'core/controller';
import { Collection } from 'discord.js';
import { Cell } from '.';

type Id = string;
type Name = string;

const BY_ID = new Collection<Id, Cell>();
const BY_NAME_AND_CONTROLLER = new Collection<Name, Cell>();

export function store_command(cell: Cell, controller: Controller) {
  BY_ID.set(cell.id, cell);
  BY_NAME_AND_CONTROLLER.set(to_name_key(cell.name, controller), cell);
}

export function get_command(id: Id) {
  return BY_ID.get(id);
}

export function get_command_by_name(name: Name, controller: Controller) {
  return BY_NAME_AND_CONTROLLER.get(to_name_key(name, controller));
}

function to_name_key(name: Name, controller: Controller): Name {
  return `${controller.name}-${name}`;
}
