import { ReactNode, Key } from "react";
import { MouseEvent } from "../event.ts";
declare global {
  declare namespace JSX {
    interface IntrinsicElements {
      box: {
        style?: import("../element.js").Style;
        children?: ReactNode;
        onMouseDown?: (e: MouseEvent) => void;
        key?: Key;
      };
    }
  }
}
