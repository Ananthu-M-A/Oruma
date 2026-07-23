const fs = require("fs");
const path = require("path");

const roots = ["components", "routes", "src"];
const names = new Set();
const visit = (entry) => {
  if (!fs.existsSync(entry)) return;
  const stat = fs.statSync(entry);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(entry)) visit(path.join(entry, child));
    return;
  }
  if (!/\.(tsx|ts)$/.test(entry) || entry.endsWith("icons.tsx")) return;
  const source = fs.readFileSync(entry, "utf8");
  for (const match of source.matchAll(/(?:name|icon|iconName)\s*[:=]\s*["']([a-z0-9-]+)["']/gi)) names.add(match[1]);
  for (const match of source.matchAll(/name\s*=\s*\{([^}]+)\}/g)) {
    for (const value of match[1].matchAll(/["']([a-z0-9-]+)["']/gi)) names.add(value[1]);
  }
};
for (const root of roots) visit(path.resolve(root));
console.log([...names].sort().join("\n"));
