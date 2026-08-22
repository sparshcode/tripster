"use client";

export type AuthMethod = "password" | "magic" | "google" | "apple";

export type AuthState = {
  email: string | null;
  method: AuthMethod;
  signedInAt: string;
};

const KEY = "tripster.auth.v1";

export function loadAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth: AuthState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(auth));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
