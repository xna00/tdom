import { Document, Element } from "../element.js";
import { createRoot, reconciler } from "../react-tdom/index.js";
import { useState, useEffect } from "react";
import Block from "../react-tdom/Block.js";

function App() {
  const [count, setCount] = useState(0);
  return (
    <Block style={{ height: "100%" }}>
      <box
        style={{ color: Math.random() > 0.5 ? "red" : "blue" }}
        onMouseDown={() => {
          setCount(count + 1);
        }}
      >
        {count}
      </box>
    </Block>
  );
}

const doc = new Document(process.stdin, process.stdout);

doc.root.style.flexDirection = "column";
doc.root.style.justifyContent = "flex-start";
doc.root.style.alignItems = "stretch";
// div.style.backgroundColor = "black";

const t = <App />;

createRoot(doc.root).render(t);
