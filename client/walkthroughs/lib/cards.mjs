// Title and closing cards shared by every walkthrough video.

const SAMPLE_NOTE = "Sample data: the names and numbers shown are not real.";

export function titleCard(guide, title, subtitle) {
  return `<div class="kicker">Oruma · ${guide}</div><h1>${title}</h1>
    <p>${subtitle}</p><div class="note">${SAMPLE_NOTE}</div>`;
}

export function closingCard(guide, title, subtitle) {
  return `<div class="kicker">Oruma · ${guide}</div><h1>${title}</h1>
    <p>${subtitle}</p>
    <div class="note">Questions? oruma9987@gmail.com · WhatsApp +91-8157039987</div>`;
}

/**
 * Returns `step(id, action)` for a video: shows the line's caption with the
 * next step number, speaks it, and runs `action` meanwhile. Lines without a
 * caption (title and closing cards) get no number.
 */
export function stepper(ctx, lines) {
  const byId = Object.fromEntries(lines.map((line) => [line.id, line]));
  let number = 0;
  return (id, action) => {
    const line = byId[id];
    if (!line) throw new Error(`Unknown line ${id}`);
    const label = line.caption ? String(++number) : "";
    return ctx.say(id, { step: label, caption: line.caption ?? "", action });
  };
}
