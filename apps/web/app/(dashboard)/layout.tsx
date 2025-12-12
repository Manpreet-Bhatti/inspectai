"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  Bell,
  User,
} from "lucide-react";

function Sidebar() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <aside className="border-border bg-card hidden w-64 flex-shrink-0 border-r lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-border flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <span className="text-primary-foreground text-sm font-bold">
                AI
              </span>
            </div>
            <span className="text-foreground text-lg font-semibold">
              InspectAI
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <Link
            href="/"
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/inspections"
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
          >
            <ClipboardList className="h-5 w-5" />
            <span>Inspections</span>
          </Link>
          <Link
            href="/settings"
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>

        {/* User Section */}
        <div className="border-border border-t p-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-full">
              <User className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-foreground truncate text-sm font-medium">
                {session?.user?.name || "User"}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {session?.user?.email || ""}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg p-1.5"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="border-border bg-card sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-4 lg:px-6">
      {/* Mobile menu button */}
      <button className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg p-2 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <span className="text-primary-foreground text-sm font-bold">AI</span>
        </div>
        <span className="text-foreground text-lg font-semibold">InspectAI</span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        {/* Notifications */}
        <button className="text-muted-foreground hover:bg-accent hover:text-accent-foreground relative rounded-lg p-2">
          <Bell className="h-5 w-5" />
          <span className="bg-destructive absolute top-1.5 right-1.5 h-2 w-2 rounded-full" />
        </button>

        {/* User dropdown (mobile) */}
        <div className="flex items-center gap-2 lg:hidden">
          <button className="bg-muted flex h-9 w-9 items-center justify-center rounded-full">
            <User className="text-muted-foreground h-5 w-5" />
          </button>
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg p-1.5"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
