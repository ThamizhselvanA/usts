
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "END_USER" | "IT_AGENT" | "ADMIN";

export type AuthUser = { id: string; email: string; role: Role };

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setAuth: (d: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (d) => set(d),
      clear: () => set({ accessToken: null, refreshToken: null, user: null })
    }),
    { name: "usts-auth" }
  )
);
