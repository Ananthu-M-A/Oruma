// Chrome's MediaRecorder writes fragmented MP4 without the real duration in
// its header, so players show the wrong length and seeking misbehaves. This
// sums the sample durations of every fragment and writes them into the
// mvhd/tkhd/mdhd boxes, and adds a mehd box. Chrome's fragments use
// moof-relative data offsets, so growing the header doesn't break them.

import fs from "node:fs";

function boxes(buf, start, end) {
  const list = [];
  let offset = start;
  while (offset + 8 <= end) {
    let size = buf.readUInt32BE(offset);
    let header = 8;
    if (size === 1) {
      size = Number(buf.readBigUInt64BE(offset + 8));
      header = 16;
    }
    if (size === 0) size = end - offset;
    list.push({ type: buf.toString("ascii", offset + 4, offset + 8), offset, size, header });
    offset += size;
  }
  return list;
}

function find(buf, parent, type) {
  return boxes(buf, parent.offset + parent.header, parent.offset + parent.size).filter(
    (box) => box.type === type,
  );
}

export function fixMp4Duration(file) {
  const buf = fs.readFileSync(file);
  const top = boxes(buf, 0, buf.length);
  const moov = top.find((box) => box.type === "moov");
  if (!moov) throw new Error("No moov box");

  // Sum sample durations per track across all fragments.
  const sums = new Map();
  for (const moof of top.filter((box) => box.type === "moof")) {
    for (const traf of find(buf, moof, "traf")) {
      const tfhd = find(buf, traf, "tfhd")[0];
      const trackId = buf.readUInt32BE(tfhd.offset + tfhd.header + 4);
      const tfhdFlags = buf.readUInt32BE(tfhd.offset + tfhd.header) & 0xffffff;
      let p = tfhd.offset + tfhd.header + 8;
      if (tfhdFlags & 0x1) p += 8;
      if (tfhdFlags & 0x2) p += 4;
      const defaultDuration = tfhdFlags & 0x8 ? buf.readUInt32BE(p) : 0;
      for (const trun of find(buf, traf, "trun")) {
        const base = trun.offset + trun.header;
        const flags = buf.readUInt32BE(base) & 0xffffff;
        const count = buf.readUInt32BE(base + 4);
        let q = base + 8 + (flags & 0x1 ? 4 : 0) + (flags & 0x4 ? 4 : 0);
        let total = 0;
        for (let i = 0; i < count; i++) {
          if (flags & 0x100) {
            total += buf.readUInt32BE(q);
            q += 4;
          } else total += defaultDuration;
          if (flags & 0x200) q += 4;
          if (flags & 0x400) q += 4;
          if (flags & 0x800) q += 4;
        }
        sums.set(trackId, (sums.get(trackId) ?? 0) + total);
      }
    }
  }

  const mvhd = find(buf, moov, "mvhd")[0];
  const mvhdBase = mvhd.offset + mvhd.header;
  // Version 0 boxes hold 32-bit times; version 1 boxes hold 64-bit times.
  const mvhdV1 = buf[mvhdBase] === 1;
  const movieTimescale = buf.readUInt32BE(mvhdBase + (mvhdV1 ? 20 : 12));
  const writeTime = (value, at, v1) =>
    v1 ? buf.writeBigUInt64BE(BigInt(value), at) : buf.writeUInt32BE(value, at);

  let longest = 0;
  for (const trak of find(buf, moov, "trak")) {
    const tkhd = find(buf, trak, "tkhd")[0];
    const tkhdBase = tkhd.offset + tkhd.header;
    const tkhdV1 = buf[tkhdBase] === 1;
    const trackId = buf.readUInt32BE(tkhdBase + (tkhdV1 ? 20 : 12));
    const mdia = find(buf, trak, "mdia")[0];
    const mdhd = find(buf, mdia, "mdhd")[0];
    const mdhdBase = mdhd.offset + mdhd.header;
    const mdhdV1 = buf[mdhdBase] === 1;
    const mediaTimescale = buf.readUInt32BE(mdhdBase + (mdhdV1 ? 20 : 12));
    const mediaDuration = sums.get(trackId) ?? 0;
    const movieDuration = Math.round((mediaDuration / mediaTimescale) * movieTimescale);
    writeTime(mediaDuration, mdhdBase + (mdhdV1 ? 24 : 16), mdhdV1);
    writeTime(movieDuration, tkhdBase + (tkhdV1 ? 28 : 20), tkhdV1);
    longest = Math.max(longest, movieDuration);
  }
  writeTime(longest, mvhdBase + (mvhdV1 ? 24 : 16), mvhdV1);

  // Add (or update) mehd inside mvex.
  const mvex = find(buf, moov, "mvex")[0];
  let output = buf;
  if (mvex) {
    const mehd = find(buf, mvex, "mehd")[0];
    if (mehd) {
      const mehdBase = mehd.offset + mehd.header;
      writeTime(longest, mehdBase + 4, buf[mehdBase] === 1);
    } else {
      const box = Buffer.alloc(16);
      box.writeUInt32BE(16, 0);
      box.write("mehd", 4, "ascii");
      box.writeUInt32BE(longest, 12);
      const insertAt = mvex.offset + mvex.header;
      buf.writeUInt32BE(mvex.size + 16, mvex.offset);
      buf.writeUInt32BE(moov.size + 16, moov.offset);
      output = Buffer.concat([buf.subarray(0, insertAt), box, buf.subarray(insertAt)]);
    }
  }
  fs.writeFileSync(file, output);
  return longest / movieTimescale;
}
