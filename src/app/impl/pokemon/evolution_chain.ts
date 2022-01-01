import { assert } from 'core/assert';
import { eager, map } from 'support/iterator';
import { Maybe } from 'support/null';

/**
 * Creates a two-dimensional array of evolution chains given a list
 * of nodes in the chain. The final output includes an array for
 * every "path" through the "tree" of evolutions. For example,
 * take Oddish, the output would be.
 *
 *     [[oddish, gloom, vileplume], [oddish, gloom, bellossom]]
 *
 * This is respected no matter where the branch point is; for example, the
 * Ralts line would output the following.
 *
 *     [[ralts, kirlia, gardevoir], [ralts, kirlia, gallade]]
 *
 * And of course, any number of branches are supported. That said, this function
 * is far from liberal in what it accepts, and has this invariant:
 *
 * ### Input Invariant
 *
 * - Input must be ordered by their `parent_id` column ascending, with a single
 * null at the beginning of the list which represents the root node. In the case
 * of a branch, ie multiple nodes with the same `parent_id`, the ordering between
 * them is undefined.
 *
 * ## Algorithm
 *
 * - Accept a list of raw nodes.
 * - Create an empty map of node IDs to nodes, hereafter `index`.
 * - Create an empty set of nodes that have not yet had children, hereafter `leaves`.
 * - Assert that the first node has no parent (see invariant above).
 * - For each raw node, hereafter `raw_node`:
 *   - If `raw_node` has no parent:
 *     - Set `ancestors_path` to `[]`.
 *   - Else:
 *     - Fetch the `parent_id` of `raw_node`.
 *     - Look it up in `index` to find the parent (a `node`), hereafter `parent`.
 *     - If `parent` does not exist, throw, as our invariant has not been upheld.
 *     - Remove `parent` from `leaves`, as it's about to have a child.
 *     - Set `ancestors_path` to a clone of `parent`'s `ancestors_path`.
 *     - Set `raw_parent` (a `raw_node`) to the raw version of `parent`.
 *     - Concatenate `raw_parent` onto the new `ancestors_path`.
 *   - Set `node` to `raw_node` and `ancestors_path`.
 *   - Add node to `index`.
 *   - Add node to `leaves`, as it has no child yet.
 * - Create the output array, a `raw_node[][]`.
 * - For each `node` remaining in `leaves`, hereafter `node`:
 *   - Set `raw_node` to the raw version of `node`.
 *   - Set `ancestors_path` to a clone of the node's `ancestors_path`.
 *   - Add `raw_node` to `ancestors_path`.
 *   - Add `ancestors_path` to the output array.
 * - Return the output array.
 */
export function build_evolution_tree<R extends RawNode>(raw_nodes: R[]): R[][] {
  const memo = new Memo();
  const root = raw_nodes[0];

  assert(!raw_nodes[0].parent_id, `First node ${root.name} must be root!`);

  for (const raw_node of raw_nodes) {
    observe_node(raw_node, memo);
  }

  // TODO: i think typescript is confused because the raw nodes are being
  // passed around a lot, but they're never constructed or edited, so
  // any type constraint `R` should remain valid...
  return <R[][]>memo.finalize_leaves();
}

/**
 * Represents the input to the tree builder.
 */
interface RawNode {
  id: number;
  name: string;
  parent_id?: Maybe<number>;
}

/**
 * Wraps a `RawNode` with information about its ancestors - all the parents
 * that came before it in this "path" of the "tree".
 *
 * `ancestors_path` stores `RawNode[]` instead of `Node[]` to avoid an
 * additional map when creating the output, and hopefully to help the GC
 * drop non-terminal paths as soon as possible.
 */
interface Node<R extends RawNode> {
  raw: R;
  ancestors_path: R[];
}

/**
 * Creates a `Node` and adds it to the `Memo`.
 */
function observe_node<R extends RawNode>(raw: R, memo: Memo<R>) {
  const ancestors_path = create_ancestors_path(raw, memo);
  const node: Node<R> = { raw, ancestors_path };

  memo.observe(node);
}

/**
 * Fetches the parent and concatenates it onto its own ancestors,
 * or just returns `[]` if this is the root node.
 */
function create_ancestors_path<R extends RawNode>(raw: R, memo: Memo<R>) {
  if (!raw.parent_id) {
    return [];
  }

  const parent = memo.fetch_parent(raw.name, raw.parent_id);
  return parent.ancestors_path.concat(parent.raw);
}

/**
 * Creates the final form of a single "path" through the "tree".
 *
 * This function is called by `Memo` on leaf nodes - those with
 * no children once the initial tree building is complete.
 *
 * Because we have all our ancestors, and we know we have no children,
 * all we have to do is add ourselves to get the final path.
 */
function leaf_into_output<R extends RawNode>(leaf_node: Node<R>) {
  return leaf_node.ancestors_path.concat(leaf_node.raw);
}

/**
 * The mutable state of the tree building process.
 */
class Memo<R extends RawNode> {
  /**
   *  An index of all nodes by their ID, to allow parents to be looked up.
   */
  private index = new Map<number, Node<R>>();

  /**
   * The set of all nodes that have not had children.
   *
   * All nodes are added to this set on creation, and are removed later once a
   * child referencing them is observed. Once the initial tree building is
   * complete, we know that anything remaining in this set must be a leaf,
   * and because they track their ancestors, we know know all the paths
   * through the tree.
   */
  private leaves = new Set<Node<R>>();

  /**
   * Looks up a parent by ID. Throws an error on absent, as input maintaining
   * the invariants must never include a nonexistant parent ID.
   */
  fetch_parent(name: string, parent_id: number) {
    const parent = this.index.get(parent_id);

    assert(parent, `Unknown parent id ${parent_id} for ${name}!`);
    this.leaves.delete(parent);

    return parent;
  }

  /**
   * Adds a newly constructed node to internal collections.
   */
  observe(node: Node<R>) {
    this.index.set(node.raw.id, node);
    this.leaves.add(node);
  }

  /**
   * Takes all remaining leaves after tree building is complete, and
   * converts them into their final form. See the documentation on `Memo.leaves`
   * and `leaf_into_output`.
   */
  finalize_leaves(): R[][] {
    return eager(map(leaf_into_output, this.leaves));
  }
}
