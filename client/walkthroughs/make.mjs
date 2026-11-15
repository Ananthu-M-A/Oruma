// Builds a walkthrough video: narration → recording → MP4.
// Usage (from client/): node walkthroughs/make.mjs patient-booking [--voice "Microsoft Hazel Desktop"]
// Output: walkthroughs/output/<name>.mp4

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compose } from "./lib/compose.mjs";
import { record, wavDurationMs } from "./lib/recorder.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const [name, ...rest] = process.argv.slice(2);
if (!name) {
  const available = fs
    .readdirSync(path.join(root, "videos"))
    .map((file) => file.replace(/\.mjs$/, ""));
  console.error(`Usage: node walkthroughs/make.mjs <video>\nVideos: ${available.join(", ")}`);
  process.exit(1);
}
const voiceIndex = rest.indexOf("--voice");
const voice = voiceIndex >= 0 ? rest[voiceIndex + 1] : "Microsoft Zira Desktop";
// --dry checks the script quickly: no voice, short pauses, no MP4.
const dry = rest.includes("--dry");

const video = await import(`./videos/${name}.mjs`);
const workDir = path.join(root, ".work", name);
const voiceDir = path.join(workDir, "voice");
fs.rmSync(workDir, { recursive: true, force: true });
fs.mkdirSync(voiceDir, { recursive: true });

let durations;
if (dry) {
  durations = Object.fromEntries(video.lines.map(({ id }) => [id, 300]));
} else {
console.log(`1/3 Narration (${voice})`);
const linesFile = path.join(workDir, "lines.json");
fs.writeFileSync(
  linesFile,
  JSON.stringify(video.lines.map(({ id, say }) => ({ id, text: say }))),
);
execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    path.join(root, "lib", "narrate.ps1"),
    "-LinesJson",
    linesFile,
    "-OutDir",
    voiceDir,
    "-Voice",
    voice,
  ],
  { stdio: "inherit" },
);
durations = Object.fromEntries(
  video.lines.map(({ id }) => [id, wavDurationMs(path.join(voiceDir, `${id}.wav`))]),
);
}

console.log("2/3 Recording the walkthrough");
await record({ outDir: workDir, prepare: video.prepare, script: video.run, durations });

if (dry) {
  console.log(`Dry run passed: ${name}`);
  process.exit(0);
}
console.log("3/3 Adding the voice and saving the MP4 (runs in real time)");
const outFile = path.join(root, "output", `${name}.mp4`);
await compose({ workDir, voiceDir, outFile });
console.log(`Done: ${outFile}`);
