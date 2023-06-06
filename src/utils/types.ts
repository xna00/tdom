import { Element, Node, NodeType, Text } from "../element.js";

export function assert(value: unknown): asserts value {
  if (!value) throw "";
}

export const isElement = (node: Node): node is Element =>
  node.nodeType === NodeType.Element;

export const isText = (node: Node): node is Text =>
  node.nodeType === NodeType.Text;

export const capitalize = <T extends string>(s: T): Capitalize<T> =>
  (s.slice(0, 1).toUpperCase() + s.slice(1)) as Capitalize<T>;
