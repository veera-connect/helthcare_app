import { Bell, Moon, Sun, Search } from "lucide-react";
import { useThemeStore } from "../../stores/themeStore";
import { useAuth } from "../../hooks/useAuth";

export function TopBar() {
  const { isDark, toggle } = useThemeStore();
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-gray-100 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      {/* Search */}
      <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 max-w-xs dark:border-slate-700 dark:bg-slate-800">
        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <input
          placeholder="Search..."
          className="bg-transparent text-sm text-gray-600 placeholder-gray-400 focus:outline-none w-full dark:text-slate-300 dark:placeholder-slate-500"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors dark:text-slate-400 dark:hover:bg-slate-800">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors dark:text-slate-400 dark:hover:bg-slate-800"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
          {(user as { email?: string })?.email?.charAt(0).toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
