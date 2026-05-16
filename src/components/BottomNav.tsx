"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function BottomNav() {
  const pathname = usePathname();
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/leads/stats");
        if (res.ok) {
          const data = await res.json();
          setNewLeadsCount(data.nuevo ?? 0);
        }
      } catch {
        // silencioso
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const activeClass = "text-[var(--color-wa-green)]";
  const inactiveClass = "text-[var(--color-wa-text-sec)]";

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-wa-header)] border-t border-[var(--color-wa-sep)] flex items-center justify-around"
      style={{ height: "calc(60px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Chats */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center gap-1 w-16 h-full ${pathname === "/" ? activeClass : inactiveClass}`}
        title="Chats"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-[10px] font-medium">Chats</span>
      </Link>

      {/* Leads */}
      <Link
        href="/leads"
        className={`flex flex-col items-center justify-center gap-1 w-16 h-full relative ${pathname === "/leads" ? activeClass : inactiveClass}`}
        title="Leads"
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {newLeadsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-wa-green)] text-white text-[10px] font-bold px-1 py-px rounded-full min-w-[16px] text-center">
              {newLeadsCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">Leads</span>
      </Link>

      {/* Turnos */}
      <Link
        href="/appointments"
        className={`flex flex-col items-center justify-center gap-1 w-16 h-full ${pathname === "/appointments" ? activeClass : inactiveClass}`}
        title="Turnos"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-[10px] font-medium">Turnos</span>
      </Link>

      {/* Tema */}
      <button
        onClick={toggleTheme}
        className={`flex flex-col items-center justify-center gap-1 w-16 h-full ${inactiveClass}`}
        title={isDark ? "Modo Claro" : "Modo Oscuro"}
      >
        {isDark ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
        <span className="text-[10px] font-medium">{isDark ? "Claro" : "Oscuro"}</span>
      </button>

      {/* Logout */}
      <button
        onClick={logout}
        className={`flex flex-col items-center justify-center gap-1 w-16 h-full text-red-500`}
        title="Cerrar sesión"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="text-[10px] font-medium">Salir</span>
      </button>
    </nav>
  );
}
