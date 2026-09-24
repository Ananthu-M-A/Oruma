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
  accessToken?: string;
  user?: AuthAccount;
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
const ACCESS_TOKEN_KEY = "oruma_access_token";
export const AUTH_CHANGED_EVENT = "oruma-auth-changed";

async function requestAuth<T = AuthResponse>(path: string, payload: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string | string[];
  };

  if (!response.ok) {
    if (response.status === 401) clearAccessToken();
    const message = Array.isArray(data.message)
      ? data.message.join(" ")
      : data.message ?? "Your session could not be verified.";
    throw new Error(message);
  }

  return data;
}

async function writeWithAuth<T>(path: string, payload: unknown, method: "PATCH" | "POST" = "PATCH") {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string | string[];
  };

  if (!response.ok) {
    if (response.status === 401) clearAccessToken();
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

export function saveAccessToken(token: string) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return window.atob(padded);
}

export function getCurrentUser(): AuthUser | null {
  const token = getAccessToken();

  if (!token) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(token.split(".")[1])) as AuthUser;

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      clearAccessToken();
      return null;
    }

    return payload;
  } catch {
    clearAccessToken();
    return null;
  }
}

export function getRedirectPathForRole(role?: AuthRole) {
  if (role === "THERAPIST") return "/profile/therapist";
  if (role === "ADMIN") return "/profile/admin";
  return "/profile/patient";
}
