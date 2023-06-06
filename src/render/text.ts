import stringWidth from "string-width";

export function layoutText(text: string, width: number) {
  const chars = [...text];
  const ret: string[] = [];
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === "\n") {
      ret.push(out);
      out = "";
      continue;
    }
    const sw = stringWidth(out + chars[i]);
    if (sw === width) {
      out += chars[i];
      ret.push(out);
      out = "";
    } else if (sw > width) {
      ret.push(out);
      out = "";
      i--;
    } else {
      out += chars[i];
    }
  }
  if (out) {
    ret.push(out);
  }
  return ret;
}

// console.log(layoutText("AB\nC你好😁", 4));
