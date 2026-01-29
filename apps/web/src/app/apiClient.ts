
import { useAuthStore } from "./authStore";

const API = import.meta.env.VITE_API_BASE_URL;

async function tryRefresh() {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });

  if (!res.ok) throw new Error("Refresh failed");
  const data = await res.json();

  useAuthStore.setState({ accessToken: data.accessToken, user: data.user });
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (res.status === 401 && useAuthStore.getState().refreshToken) {
    await tryRefresh();
    return apiFetch<T>(path, init);
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
