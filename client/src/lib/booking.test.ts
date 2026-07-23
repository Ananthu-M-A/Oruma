import { describe, expect, it } from "vitest";
import { canPatientCancelAppointment, getEarliestBookableSlotTime } from "./booking";

describe("booking policies", () => {
  it("rounds the earliest selectable booking time upward", () => {
    expect(getEarliestBookableSlotTime(1_700_000_000_001) % 60_000).toBe(0);
  });

  it("allows cancellation only during the first hour and before the slot", () => {
    const now = Date.now();
    const appointment = { status: "PENDING", createdAt: new Date(now - 30 * 60_000).toISOString(), slot: { startTime: new Date(now + 2 * 60 * 60_000).toISOString() } } as never;
    expect(canPatientCancelAppointment(appointment, now)).toBe(true);
    expect(canPatientCancelAppointment(appointment, now + 31 * 60_000)).toBe(false);
  });
});
