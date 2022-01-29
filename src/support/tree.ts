import { Maybe } from './null';

const PIPE = '│';
const ELBOW = '└──';
const TEE = '├──';
const PIPE_PREFIX = '│   ';
const SPACE_PREFIX = '    ';

interface Opts<T> {
  root: T;
  skip?(node: T): boolean;
  into_string(node: T): string;
  into_children(parent: T): Maybe<T[]>;
}

export function render_tree<T>(opts: Opts<T>) {}

function render_node<T>(node: T, index: number, opts: Opts<T>) {}
