#!/usr/bin/env node
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

mkdirSync(join(root, "dist"), { recursive: true });

execSync(
  "npx @tailwindcss/cli -i ./src/globals.css -o ./dist/kui-gantt.css --minify",
  { cwd: root, stdio: "inherit" },
);

console.log("CSS built → dist/kui-gantt.css");
