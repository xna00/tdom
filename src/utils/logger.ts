import { Console } from "console";
import { createWriteStream, openSync } from "fs";
import { Writable } from "stream";
import { WriteStream } from "tty";
const logFile = process.env["LOG_FILE"] || "/dev/null";
let writable: Writable;
try {
  const fd = openSync(logFile, "w");
  writable = new WriteStream(fd);
} catch {
  writable = createWriteStream(logFile);
}
const logger = new Console(writable);
export default logger;
