// Combines the silent walkthrough video with its narration clips into one
// MP4 (H.264 + AAC). Uses the installed Google Chrome: it plays the video,
// plays each clip at its logged time, and records the result with
// MediaRecorder. Runs in real time, so a 2-minute video takes 2 minutes.

import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { fixMp4Duration } from "./fix-mp4.mjs";

const ORIGIN = "http://walkthrough.compose";

const composerHtml = `<!doctype html><html><body style="margin:0;background:#000">
<video id="v" muted playsinline style="width:100%"></video>
<script>
window.compose = async function (timeline, mimeType) {
  const video = document.getElementById("v");
  video.src = "/silent.webm";
  await new Promise((resolve, reject) => {
    video.onloadeddata = resolve;
    video.onerror = () => reject(new Error("Video failed to load"));
  });

  const audio = new AudioContext({ sampleRate: 48000 });
  const destination = audio.createMediaStreamDestination();
  const clips = await Promise.all(timeline.map(async (item) => {
    const response = await fetch("/voice/" + item.id + ".wav");
    const buffer = await audio.decodeAudioData(await response.arrayBuffer());
    return { at: item.at / 1000, buffer };
  }));

  const stream = new MediaStream([
    ...video.captureStream().getVideoTracks(),
    ...destination.stream.getAudioTracks(),
  ]);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 6000000,
    audioBitsPerSecond: 128000,
  });
  recorder.ondataavailable = async (event) => {
    if (!event.data.size) return;
    const bytes = new Uint8Array(await event.data.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000)
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    await window.saveChunk(btoa(binary));
  };
  const stopped = new Promise((resolve) => (recorder.onstop = resolve));

  await audio.resume();
  recorder.start(1000);
  await video.play();
  const zero = audio.currentTime;
  for (const clip of clips) {
    const source = audio.createBufferSource();
    source.buffer = clip.buffer;
    source.connect(destination);
    source.start(zero + clip.at);
  }
  await new Promise((resolve) => (video.onended = resolve));
  await new Promise((resolve) => setTimeout(resolve, 300));
  recorder.stop();
  await stopped;
  await new Promise((resolve) => setTimeout(resolve, 500));
};
</script></body></html>`;

export async function compose({ workDir, voiceDir, outFile }) {
  const { timeline } = JSON.parse(
    fs.readFileSync(path.join(workDir, "timeline.json"), "utf8"),
  );
  const browser = await chromium.launch({
    // Google Chrome includes the H.264/AAC encoders; open-source Chromium doesn't.
    channel: "chrome",
    args: ["--autoplay-policy=no-user-gesture-required"],
  });
  try {
    const page = await browser.newPage();
    await page.route(`${ORIGIN}/**`, (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === "/") {
        return route.fulfill({ contentType: "text/html", body: composerHtml });
      }
      if (url.pathname === "/silent.webm") {
        return route.fulfill({
          contentType: "video/webm",
          body: fs.readFileSync(path.join(workDir, "silent.webm")),
        });
      }
      const voice = url.pathname.match(/^\/voice\/([\w-]+)\.wav$/);
      if (voice) {
        return route.fulfill({
          contentType: "audio/wav",
          body: fs.readFileSync(path.join(voiceDir, `${voice[1]}.wav`)),
        });
      }
      return route.fulfill({ status: 404, body: "" });
    });

    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    const out = fs.openSync(outFile, "w");
    await page.exposeFunction("saveChunk", (base64) => {
      fs.writeSync(out, Buffer.from(base64, "base64"));
    });
    await page.goto(`${ORIGIN}/`);
    const mimeType = await page.evaluate(() =>
      [
        "video/mp4;codecs=avc1.4d002a,mp4a.40.2",
        "video/mp4;codecs=avc1,mp4a.40.2",
        "video/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type)),
    );
    if (!mimeType) {
      throw new Error("This Chrome cannot record MP4. Update Google Chrome.");
    }
    await page.evaluate(
      ([items, type]) => window.compose(items, type),
      [timeline, mimeType],
    );
    fs.closeSync(out);
  } finally {
    await browser.close();
  }
  return fixMp4Duration(outFile);
}
