import stringWidth from "string-width";
import yoga from "yoga-layout-prebuilt";
import type { YogaNode } from "yoga-layout-prebuilt";
import { assert, capitalize, isElement, isText } from "../utils/types.js";
const { Node: YNode } = yoga;
import { Node, Text } from "../element.js";
import {
  alignItemsMap,
  flexDirectionMap,
  flexWrapMap,
  justifyContentMap,
} from "./maps.js";
import chalk from "chalk";
import { font } from "./font.js";
import { layoutText } from "./text.js";
import logger from "../utils/logger.js";

type A = {
  width?: number | string;
  height?: number | string;
  yNode: YogaNode;
};

function layout(node: Node): A {
  let ret: A;
  const yNode = YNode.create();
  node.yNode = yNode;
  if (isElement(node)) {
    const children = node.childNodes.map(layout);
    children.forEach((n, i) => {
      yNode.insertChild(n.yNode, i);
    });
    ret = {
      height: node.style.height,
      width: node.style.width,
      yNode,
    };
    if (node.style.flexDirection) {
      yNode.setFlexDirection(flexDirectionMap[node.style.flexDirection]);
    } else {
      yNode.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
    }
    if (node.style.flexWrap) {
      yNode.setFlexWrap(flexWrapMap[node.style.flexWrap]);
    }
    if (node.style.justifyContent) {
      yNode.setJustifyContent(justifyContentMap[node.style.justifyContent]);
    }
    if (node.style.alignItems) {
      yNode.setAlignItems(alignItemsMap[node.style.alignItems]);
    }
    if (node.style.flexGrow !== undefined) {
      yNode.setFlexGrow(node.style.flexGrow);
    }
    if (node.style.marginTop === "auto") {
      yNode.setMarginAuto(yoga.EDGE_TOP);
    }
    if (node.style.position === "absolute") {
      yNode.setPositionType(yoga.POSITION_TYPE_ABSOLUTE);
    }
    if (node.style.top !== undefined) {
      yNode.setPosition(yoga.EDGE_TOP, node.style.top);
    }
    if (node.style.left !== undefined) {
      yNode.setPosition(yoga.EDGE_LEFT, node.style.left);
    }
  } else {
    assert(isText(node));
    const value = node.nodeValue;
    ret = {
      width: Math.max(...value.split("\n").map((line) => stringWidth(line))),
      height: value.split("\n").length,
      yNode,
    };
    // yNode.setMinWidth(
    //   Math.max(...value.split(" ").map((line) => stringWidth(line)))
    // );
  }
  logger.log(ret);
  if (ret.height !== undefined) {
    yNode.setHeight(ret.height);
  }
  if (ret.width !== undefined) {
    yNode.setWidth(ret.width);
  }
  return ret;
}

function layout2(e: Node) {
  e.yNode!.calculateLayout();
  const stack: Node[] = [e];
  while (stack.length) {
    const node = stack.shift()!;
    if (isText(node)) {
      const width = Math.min(
        ...[
          node.yNode?.getComputedWidth(),
          node.parentNode?.yNode?.getComputedWidth(),
        ].map(Number)
      );
      // console.log(width);
      if (width !== undefined) {
        const textLayout = layoutText(node.nodeValue, width);
        node.textLayout = textLayout;
        node.yNode?.setWidth(width);
        node.yNode?.setHeight(textLayout.length);
      }
    } else {
      stack.unshift(...node.childNodes);
    }
  }
}

function output(e: Node, x = 0, y = 0) {
  assert(e.yNode);
  assert(e.ownerDocument);
  // console.log(e.yNode.getComputedLayout());
  const { left, top, width, height } = e.yNode.getComputedLayout();
  x += left;
  y += top;
  if (isElement(e)) {
    e.clientWidth = width;
    e.clientHeight = height;
    e.clientLeft = x;
    e.clientTop = y;

    // console.log(e.style, e.yNode.getComputedLayout());
    if (e.style.backgroundColor) {
      for (let row = 0; row < height; row++) {
        e.ownerDocument.outStream.cursorTo(x, y + row);
        const out = " ".repeat(width);
        e.ownerDocument.outStream.write(font(e)(out));
      }
    }
    chalk.reset();
    e.childNodes.forEach((c) => output(c, x, y));
  } else {
    assert(isText(e));
    const parent = e.parentNode;
    assert(parent);
    assert(isElement(parent));
    const style = font(parent);
    // process.stdout.cursorTo(x , y);
    // process.stdout.write(style(e.nodeValue));
    for (let row = 0; row < e.textLayout.length; row++) {
      e.ownerDocument.outStream.cursorTo(x, y + row);
      e.ownerDocument.outStream.write(style(e.textLayout[row]));
    }
    chalk.reset();
  }
}

export function render(e: Node) {
  e.ownerDocument?.console.clear();
  const renderTree = layout(e);
  renderTree.yNode.calculateLayout();
  layout2(e);
  renderTree.yNode.calculateLayout();
  const stack: Node[] = [e];
  while (stack.length) {
    const node = stack.shift()!;
    const layout = node.yNode?.getComputedLayout();
    logger.log(node.nodeName, node.textContent, layout);
    // logger.log(node.nodeName, node.textContent);
    stack.unshift(...node.childNodes);
  }
  output(e);
}
