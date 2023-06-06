import chalk, {
  BackgroundColorName,
  ChalkInstance,
  ForegroundColorName,
} from "chalk";
import { Element } from "../element.js";
import { capitalize } from "../utils/types.js";

function getColor(node: Element | null): ForegroundColorName | undefined {
  let e = node;
  while (e) {
    if (e.style.color) {
      return e.style.color;
    }
    e = e.parentElement;
  }
}

function getBackgroundColor(
  node: Element | null
): BackgroundColorName | undefined {
  let e = node;
  while (e) {
    if (e.style.backgroundColor) {
      return `bg${capitalize(e.style.backgroundColor)}` as const;
    }
    e = e.parentElement;
  }
}

export function font(node: Element): ChalkInstance {
  let style = chalk;
  const color = getColor(node);
  if (color) {
    style = style[color];
  }
  const backgroundColor = getBackgroundColor(node);
  if (backgroundColor) {
    style = style[backgroundColor];
  }
  if (node.style.fontWeight === "bold") {
    style = style.bold;
  }
  if (node.style.fontStyle === "italic") {
    style = style.italic;
  }
  return style;
}
