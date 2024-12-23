import { EventTarget, Event, EventHandler, MouseEvent } from "./event.js";
import type { YogaNode } from "yoga-layout-prebuilt";
import { isElement } from "./utils/types.js";
import {
  alignItemsMap,
  flexDirectionMap,
  justifyContentMap,
} from "./render/maps.js";
import { ForegroundColorName, BackgroundColorName } from "chalk";
import { ReadStream, WriteStream } from "tty";
import logger from "./utils/logger.js";
import { Console } from "console";
import { render } from "./render/index.js";

export enum NodeType {
  Element = 1,
  Text = 3,
  Document = 9,
}
export class Node extends EventTarget {
  parentNode: Node | null = null;
  firstChild: Node | null = null;
  lastChild: Node | null = null;
  previousSibling: Node | null = null;
  nextSibling: Node | null = null;
  yNode: YogaNode | null = null;
  ownerDocument: Document | null = null;
  id = "";

  constructor(
    public readonly nodeType: NodeType,
    public readonly nodeName: "#text" | string,
    public readonly nodeValue: string | null
  ) {
    super();
  }

  get childNodes(): Node[] {
    const ret: Node[] = [];
    let node = this.firstChild;
    while (node) {
      // logger.log(ret.length, node.nodeName, node.id, node.textContent);
      ret.push(node);
      node = node.nextSibling;
    }
    return ret;
  }

  get textContent() {
    const stack: Node[] = [this];
    const output: string[] = [];
    while (stack.length) {
      const node = stack.shift()!;
      if (node.nodeType === NodeType.Text) {
        output.push(node.nodeValue!);
      }
      stack.unshift(...node.childNodes);
    }
    return output.flat().join("");
  }

  appendChild(aChild: Node) {
    // logger.log("appendChild", this.id, aChild.id);
    aChild.parentNode?.removeChild(aChild);
    aChild.parentNode = this;
    aChild.previousSibling = this.lastChild;
    if (this.lastChild) {
      this.lastChild.nextSibling = aChild;
    }
    this.lastChild = aChild;
    if (!this.firstChild) {
      this.firstChild = aChild;
    }
  }

  removeChild(child: Node) {
    // logger.log("removeChild", this.id, child.id);
    if (child.parentNode !== this) {
      throw new Error();
    }
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling;
    } else {
      child.parentNode.firstChild = child.nextSibling;
    }
    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling;
    } else {
      child.parentNode.lastChild = child.previousSibling;
    }
    child.parentNode = child.previousSibling = child.nextSibling = null;
  }

  insertBefore(newNode: Node, referenceNode: Node | null) {
    // logger.log("insertBefore", this.id, newNode.id, referenceNode?.id);
    if (!referenceNode) {
      this.appendChild(newNode);
    } else {
      newNode.parentNode?.removeChild(newNode);
      newNode.parentNode = this;
      newNode.nextSibling = referenceNode;
      newNode.previousSibling = referenceNode.previousSibling;
      referenceNode.previousSibling = newNode;
      if (newNode.previousSibling) {
        newNode.previousSibling.nextSibling = newNode;
      } else {
        this.firstChild = newNode;
      }
    }
  }

  hasChildNodes() {
    return !!this.firstChild;
  }
  getRootNode() {
    let node: Node = this;
    while (node.parentNode) {
      node = node.parentNode;
    }
    return node;
  }
}
export interface Element extends Node {
  addEventListener: (
    type: "click" | "mousedown" | "mouseup",
    cb: (e: MouseEvent) => void
  ) => void;
  new (): Element;
}

type A = "top" | "right" | "bottom" | "left";
export type Style = {
  height?: number | string;
  width?: number | string;
  flexDirection?: keyof typeof flexDirectionMap;
  flexWrap?: "wrap" | "nowrap" | "wrap-reverse";
  justifyContent?: keyof typeof justifyContentMap;
  alignItems?: keyof typeof alignItemsMap;
  flexGrow?: number;
  color?: ForegroundColorName;
  backgroundColor?: BackgroundColorName extends `bg${infer C}`
    ? Uncapitalize<C>
    : never;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  position?: "relative" | "absolute";
} & {
  [k in `margin${Capitalize<A>}` | A]?: number | string;
};
export class Element extends Node {
  style: Style = {};
  clientWidth: number = -1;
  clientHeight: number = -1;
  clientTop = -1;
  clientLeft = -1;

  get children() {
    return this.childNodes.filter(isElement);
  }
  get childElementCount() {
    return this.children.length;
  }

  get firstElementChild(): Element | null {
    return this.children.at(0) ?? null;
  }

  get lastElementChild(): Element | null {
    return this.children.at(-1) ?? null;
  }

  get nextElementSibling(): Element | null {
    let node = this.previousSibling;
    while (node) {
      if (isElement(node)) {
        break;
      }
      node = node.nextSibling;
    }
    return node;
  }

  get previousElementSibling(): Element | null {
    let node = this.previousSibling;
    while (node) {
      if (isElement(node)) {
        break;
      }
      node = node.previousSibling;
    }
    return node;
  }
  get parentElement(): Element | null {
    let ret = this.parentNode;
    while (ret) {
      if (isElement(ret)) {
        return ret;
      }
      ret = ret.parentNode;
    }
    return null;
  }

  remove() {
    this.parentNode?.removeChild(this);
  }
}

export interface Text extends Node {
  nodeValue: string;
}
export class Text extends Node {
  textLayout: string[] = [];
  constructor(data = "") {
    super(NodeType.Text, "#text", data);
  }
}

function findClickTarget(el: Element, e: MouseEvent): Element | null {
  if (el.yNode) {
    for (const c of el.children.reverse()) {
      const t = findClickTarget(c, e);
      if (t) {
        return t;
      }
    }
    const { clientLeft, clientTop, clientWidth, clientHeight } = el;
    // logger.log(e.x, e.y, clientLeft, clientTop, clientHeight, clientWidth);
    if (
      clientLeft <= e.x &&
      clientLeft + clientWidth >= e.x &&
      clientTop <= e.y &&
      clientTop + clientHeight >= e.y
    ) {
      return el;
    }
  }
  return null;
}

export class Document extends Node {
  public root: Element = this.createElement("div");
  console: Console;
  constructor(public inStream: ReadStream, public outStream: WriteStream) {
    super(NodeType.Document, "#document", null);
    this.root.style.width = outStream.columns;
    this.root.style.height = outStream.rows;
    this.console = new Console(outStream);
    inStream.setRawMode(true);
    outStream.write("\x1B[?1000;1006h");
    outStream.write("\x1B[?25l");
    process.addListener("exit", () => {
      this.console.clear();
      inStream.setRawMode(false);
      outStream.write("\x1B[?1000;1006l");
      outStream.write("\x1B[?25h");
    });

    inStream.addListener("data", (data) => {
      if (
        [...data]
          .map((c) => String.fromCharCode(c))
          .join("")
          .startsWith("\x1B[<")
      ) {
        const seq = [...data]
          .map((c) => String.fromCharCode(c))
          .slice(3)
          .join("");
        const [button, x, y] = seq.slice(0, -1).split(";").map(Number);
        // logger.log(seq.slice(-1));
        if (button === 0 || button === 2) {
          const e = new MouseEvent(
            seq.slice(-1) === "M" ? "mousedown" : "mouseup",
            button,
            x - 1,
            y - 1
          );
          if (!this.root) return;
          const target = findClickTarget(this.root, e);
          e.target = target;
          let currentTarget = target;
          // logger.log(target?.nodeName, target?.textContent);
          while (currentTarget) {
            e.currentTarget = currentTarget;
            currentTarget.dispatchEvent(e);
            if (!e.propagation) {
              break;
            }
            currentTarget = currentTarget.parentElement;
          }
        }
      }
    });
    outStream.addListener("resize", () => {
      this.root.style.width = outStream.columns;
      this.root.style.height = outStream.rows;
      render(this.root);
    });
  }
  createElement(name: string) {
    const ret = new Element(NodeType.Element, name, null);
    ret.ownerDocument = this;
    return ret;
  }

  createTextNode(data: string) {
    const ret = new Text(data);
    ret.ownerDocument = this;
    return ret;
  }
}
