import createReconciler from "react-reconciler";
import {
  DiscreteEventPriority,
  ContinuousEventPriority,
  DefaultEventPriority,
} from "react-reconciler/constants.js";

import { Element, Style, Text } from "../element.js";
import { assert } from "../utils/types.js";
import { ReactNode } from "react";
import { render } from "../render/index.js";
import logger from "../utils/logger.js";

const noop = () => null;
const reconciler = createReconciler<
  "div",
  JSX.IntrinsicElements["box"],
  Element,
  Element,
  Text,
  Element,
  Element,
  unknown,
  unknown,
  JSX.IntrinsicElements["box"],
  unknown,
  unknown,
  unknown
>({
  supportsMutation: true,
  supportsPersistence: false,
  createInstance(type, props, root) {
    assert(root.ownerDocument);
    const e = root.ownerDocument.createElement(type);
    if (props.id) {
      e.id = props.id;
    }
    if (props.style) e.style = props.style;
    if (props.onMouseDown) {
      e.addEventListener("mousedown", props.onMouseDown);
    }
    return e;
  },
  createTextInstance(text, root) {
    assert(root.ownerDocument);
    return root.ownerDocument.createTextNode(text);
  },
  appendInitialChild(parentNode, child) {
    parentNode.appendChild(child);
  },
  finalizeInitialChildren: () => false,
  prepareUpdate: (instance, type, oldProps, newProps) => newProps,
  shouldSetTextContent: () => false,
  getRootHostContext() {
    return null;
  },
  getChildHostContext() {
    return null;
  },
  getPublicInstance: (instance) => instance,
  prepareForCommit: noop,
  resetAfterCommit: (root) => {
    render(root);
  },
  preparePortalMount: noop,
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  isPrimaryRenderer: true,
  getCurrentEventPriority() {
    return DefaultEventPriority;
  },
  getInstanceFromNode: noop,
  beforeActiveInstanceBlur: noop,
  afterActiveInstanceBlur: noop,
  prepareScopeUpdate: noop,
  getInstanceFromScope: noop,
  detachDeletedInstance: noop,
  supportsHydration: false,
  clearContainer: () => false,
  appendChildToContainer(container, child) {
    container.appendChild(child);
  },
  commitTextUpdate(textInstance, oldText, newText) {
    textInstance.nodeValue = newText;
  },
  commitUpdate(
    instance,
    updatePayload,
    type,
    prevProps,
    nextProps,
    internalHandle
  ) {
    instance.style = {
      ...instance.style,
      ...nextProps.style,
    };
    instance.removeEventListener("mousedown", prevProps.onMouseDown);
    if (nextProps.onMouseDown)
      instance.addEventListener("mousedown", nextProps.onMouseDown);
  },
  appendChild(parentInstance, child) {
    parentInstance.appendChild(child);
  },
  removeChild(parentInstance, child) {
    parentInstance.removeChild(child);
  },
  removeChildFromContainer(container, child) {
    container.removeChild(child);
  },
  resetTextContent(instance) {},
  insertBefore(parentInstance, child, beforeChild) {
    parentInstance.insertBefore(child, beforeChild);
  },
});

function createRoot(root: Element) {
  const container = reconciler.createContainer(
    root,
    0,
    null,
    false,
    null,
    "",
    logger.log,
    null
  );
  return {
    render(element: ReactNode) {
      reconciler.updateContainer(element, container);
    },
  };
}

export { reconciler, createRoot };
