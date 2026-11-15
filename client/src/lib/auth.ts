export type AuthRole = "PATIENT" | "THERAPIST" | "ADMIN";

type AuthUser = {
  userId: string;
  email: string;
  role: AuthRole;
  mustChangePassword?: boolean;
  fullName?: string | null;
  exp?: number;
  iat?: number;
};

export type AuthAccount = {
  id: string;
  email: string;
  role: AuthRole;
  fullName?: string | null;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
  healthInfo?: Record<string, unknown> | null;
  createdAt: string;
  mustChangePassword?: boolean;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  fullName?: string;
  phone?: string;
  age?: number | null;
  gender?: string;
  healthInfo?: Record<string, unknown> | null;
};

type AuthResponse = {
  user?: AuthAccount;
  expiresAt?: string;
  id?: string;
  email?: string;
  role?: AuthRole;
  createdAt?: string;
  message?: string;
};

const configuredApiBaseUrl = import.meta.env.VITE_API_URL?.trim().replace(
  /\/$/,
  "",
);
export const API_BASE_URL =
  configuredApiBaseUrl ||
  (import.meta.env.PROD ? "https://api.oruma.me" : "/api");
const SESSION_HINT_KEY = "oruma_session";
// Tokens stored by older builds; removed on the next sign-in or sign-out.
const LEGACY_ACCESS_TOKEN_KEY = "oruma_access_token";
export const AUTH_CHANGED_EVENT = "oruma-auth-changed";

/** fetch() that sends the httpOnly session cookie to the API. */
export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, { ...init, credentials: "include" });
}

async function requestAuth<T = AuthResponse>(path: string, payload: Record<string, unknown>) {
  const response = await apiFetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as AuthResponse & {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(" ")
      : data.message ?? "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return data as T;
}

async function requestWithAuth<T>(path: string) {
  const response = await apiFetch(`${API_BASE_URL}${path}`);

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string | string[];
  };

  if (!response.ok) {
    if (response.status === 401) clearSession();
    const message = Array.isArray(data.message)
      ? data.message.join(" ")
      : data.message ?? "Your session could not be verified.";
    throw new Error(message);
  }

  return data;
}

async function writeWithAuth<T>(path: string, payload: unknown, method: "PATCH" | "POST" = "PATCH") {
  const response = await apiFetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string | string[];
  };

  if (!response.ok) {
    if (response.status === 401) clearSession();
    const message = Array.isArray(data.message)
      ? data.message.join(" ")
      : data.message ?? "Unable to save profile.";
    throw new Error(message);
  }

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  return data;
}

export function login(payload: LoginPayload) {
  return requestAuth("/auth/login", payload);
}

export function requestLoginOtp(payload: { identifier: string }) {
  return requestAuth("/auth/login/otp/request", payload);
}

export function verifyLoginOtp(payload: { identifier: string; code: string }) {
  return requestAuth("/auth/login/otp/verify", payload);
}

export function requestBookingOtp(payload: { identifier: string }) {
  return requestAuth<{ message: string; devCode?: string }>("/auth/booking/otp/request", payload);
}

export function verifyBookingOtp(payload: { identifier: string; code: string }) {
  return requestAuth<{ verificationToken: string; expiresInSeconds: number }>("/auth/booking/otp/verify", payload);
}

export function exportMyData() {
  return requestWithAuth<Record<string, unknown>>("/privacy/me/export");
}

export function createPrivacyRequest(type: "EXPORT" | "ERASURE" | "CORRECTION", reason?: string) {
  return writeWithAuth("/privacy/me/requests", { type, reason }, "POST");
}

export function register(payload: RegisterPayload) {
  return requestAuth("/auth/register", payload);
}

export function getMyAccount() {
  return requestWithAuth<AuthAccount>("/user/me");
}

export function updateMyAccount(payload: Partial<AuthAccount>) {
  return writeWithAuth<AuthAccount>("/user/me", payload);
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return writeWithAuth<{ message: string }>("/user/me/password", payload);
}

/**
 * The access token lives in an httpOnly cookie set by the API, so page scripts
 * can't read it. The browser keeps only this non-secret hint (who is signed
 * in, and until when) to drive the UI. The API checks the cookie on every call.
 */
type SessionHint = {
  userId: string;
  email: string;
  role: AuthRole;
  mustChangePassword?: boolean;
  exp: number;
};

type SessionResponse = {
  user?: Pick<AuthAccount, "id" | "email" | "role" | "mustChangePassword">;
  expiresAt?: string;
};

export function saveSession(response: SessionResponse) {
  if (!response.user || !response.expiresAt) return;
  const hint: SessionHint = {
    userId: response.user.id,
    email: response.user.email,
    role: response.user.role,
    mustChangePassword: response.user.mustChangePassword ?? false,
    exp: Math.floor(new Date(response.expiresAt).getTime() / 1000),
  };
  try {
    window.localStorage.setItem(SESSION_HINT_KEY, JSON.stringify(hint));
    window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  } catch {
    // Storage can be unavailable (private mode); the cookie still works.
  }
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

/** Forgets the local session hint. Use logout() to also end the API session. */
export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_HINT_KEY);
    window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  } catch {
    // Ignore unavailable storage.
  }
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

/** Forgets the local hint at once, then clears the httpOnly cookie on the API. */
export async function logout() {
  clearSession();
  try {
    await apiFetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      keepalive: true,
    });
  } catch {
    // Signed out locally even if the API can't be reached.
  }
}

export function isSignedIn() {
  return getCurrentUser() !== null;
}

export function getCurrentUser(): AuthUser | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(SESSION_HINT_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const hint = JSON.parse(raw) as SessionHint;
    if (!hint.userId || !hint.role || !hint.exp || hint.exp * 1000 < Date.now()) {
      clearSession();
      return null;
    }
    return {
      userId: hint.userId,
      email: hint.email,
      role: hint.role,
      mustChangePassword: hint.mustChangePassword,
      exp: hint.exp,
    };
  } catch {
    clearSession();
    return null;
  }
}

export function getRedirectPathForRole(role?: AuthRole) {
  if (role === "THERAPIST") return "/profile/therapist";
  if (role === "ADMIN") return "/profile/admin";
  return "/profile/patient";
}
