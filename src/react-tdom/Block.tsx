import { PropsWithChildren } from "react";
import { Style } from "../element.js";

export default (props: JSX.IntrinsicElements["box"]) => {
  return (
    <box
      {...props}
      style={{
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        ...props.style,
      }}
    ></box>
  );
};
