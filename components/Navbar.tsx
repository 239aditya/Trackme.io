"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  Layers, 
  BookOpen, 
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page, don't show navigation
  if (pathname === "/login") {
    return null;
  }

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Weeks", href: "/weeks", icon: CalendarDays },
    { name: "Sessions", href: "/sessions", icon: CheckSquare },
    { name: "Projects", href: "/projects", icon: Layers },
    { name: "Log", href: "/log", icon: BookOpen },
  ];

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Sign out error", e);
      router.push("/login");
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-300 dark:border-stone-800 bg-[#faf8f5]/95 dark:bg-[#111317]/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Title */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-mono text-xs font-bold">
              AI
            </span>
            <div className="leading-none">
              <span className="font-mono text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-teal-700 dark:group-hover:text-teal-400">
                trackme<span className="text-teal-700 dark:text-teal-400">.io</span>
              </span>
              <span className="hidden sm:inline text-[11px] text-stone-500 dark:text-stone-400 font-mono ml-2">
                12-week logbook
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium font-mono rounded-md transition-colors ${
                    active
                      ? "bg-stone-200/80 dark:bg-stone-800 text-teal-800 dark:text-teal-300 font-semibold"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User / Sign Out Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800/50"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-300 dark:border-stone-800 bg-[#faf8f5] dark:bg-[#111317] px-4 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-mono rounded-md ${
                  active
                    ? "bg-stone-200 dark:bg-stone-800 text-teal-800 dark:text-teal-300 font-semibold"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
