import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () =>
        set((s) => {
          const next = !s.isDark;
          document.documentElement.classList.toggle("dark", next);
          return { isDark: next };
        }),
      setDark: (dark) => {
        document.documentElement.classList.toggle("dark", dark);
        set({ isDark: dark });
      },
    }),
    { name: "theme" }
  )
);

// Apply theme on load
const stored = localStorage.getItem("theme");
if (stored) {
  try {
    const parsed = JSON.parse(stored);
    if (parsed?.state?.isDark) {
      document.documentElement.classList.add("dark");
    }
  } catch {
    // ignore
  }
}
