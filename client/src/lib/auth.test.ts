import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch, clearSession, getCurrentUser, logout, saveSession } from "./auth";

const user = {
  id: "patient-1",
  email: "patient@oruma.test",
  role: "PATIENT" as const,
  mustChangePassword: false,
};

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("cookie sessions", () => {
  it("stores only a non-secret hint, never a token", () => {
    saveSession({ user, expiresAt: new Date(Date.now() + 60_000).toISOString() });

    expect(getCurrentUser()).toEqual(
      expect.objectContaining({ userId: "patient-1", role: "PATIENT" }),
    );
    const stored = Object.values({ ...window.localStorage }).join(" ");
    expect(stored).not.toMatch(/eyJ|accessToken|Bearer/);
  });

  it("treats an expired hint as signed out", () => {
    saveSession({ user, expiresAt: new Date(Date.now() - 1000).toISOString() });
    expect(getCurrentUser()).toBeNull();
  });

  it("removes tokens left by older builds", () => {
    window.localStorage.setItem("oruma_access_token", "old.jwt.token");
    clearSession();
    expect(window.localStorage.getItem("oruma_access_token")).toBeNull();
  });

  it("sends the session cookie with API requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));
    await apiFetch("/api/user/me");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/user/me",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("logout clears the hint and asks the API to clear the cookie", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    saveSession({ user, expiresAt: new Date(Date.now() + 60_000).toISOString() });

    await logout();

    expect(getCurrentUser()).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/logout$/),
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });
});
