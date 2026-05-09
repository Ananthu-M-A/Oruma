export type AuthRole = "PATIENT" | "THERAPIST" | "ADMIN";

export type AuthUser = {
  userId: string;
  email: string;
  role: AuthRole;
  exp?: number;
  iat?: number;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  role: Extract<AuthRole, "PATIENT" | "THERAPIST">;
};

type AuthResponse = {
  accessToken?: string;
  id?: string;
  email?: string;
  role?: AuthRole;
  createdAt?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
const ACCESS_TOKEN_KEY = "oruma_access_token";

async function requestAuth(path: string, payload: LoginPayload | RegisterPayload) {
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

  return data;
}

export function login(payload: LoginPayload) {
  return requestAuth("/auth/login", payload);
}

export function register(payload: RegisterPayload) {
  return requestAuth("/auth/register", payload);
}

export function saveAccessToken(token: string) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
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
  if (role === "THERAPIST") return "/therapists";
  if (role === "ADMIN") return "/therapists";
  return "/therapists";
}
