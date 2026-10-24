
import { api } from "../lib/api";
import type { User } from "../lib/types";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return sessionStorage.getItem("access_token");
}

export async function getCurrentUser(): Promise<User> {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await api.get<User>(
    "/api/v1/auth/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export function authHeaders() {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export function logout() {
  sessionStorage.removeItem("access_token");
  window.location.href = "/login";
}
