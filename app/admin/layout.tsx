"use client";

import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/user-menu";
import Link from "next/link";
import { Mail, Key, Users, FileText, LayoutDashboard, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/tokens", label: "Tokens", icon: Key },
  { href: "/admin/accounts", label: "Accounts", icon: Users },
  { href: "/admin/logs", label: "Audit Logs", icon: FileText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex bg-[#0d1117]">
      {/* Sidebar - AWS Builder Center style */}
      <aside className="w-64 bg-[#0d1117] border-r border-[#30363d] p-4 flex flex-col">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-6 px-2">
          <div className="text-white">
            <svg className="h-8 w-auto" viewBox="0 0 100 60" fill="currentColor">
              <path d="M25.5 35.5c0 .3.1.5.1.7l-8.7 10.2-2.5-1.6 9.5-11c.2.1.4.2.6.2.4.6.6 1.1 1 1.5zm-7.7-6.2l-4.8-3.5c-.3-.2-.6-.3-1-.3-.8 0-1.5.4-1.9 1.1l-5.4 9.3 2.1 1.3 5.2-8.9.2.1 4.8 3.4c.7.5 1.6.5 2.2.1.7-.4 1-1.1.9-1.9-.1-.6-.3-1.1-.3-1.7z"/>
              <path d="M93.2 48.5L77.8 60H22.2L6.8 48.5l8.4-12.4 8.7 6.2 7.7-9.1-7.7-9.1-8.7 6.2L6.8 17.9 22.2 6.4h55.6l15.4 11.5-8.4 12.4-8.7-6.2-7.7 9.1 7.7 9.1 8.7-6.2 8.4 12.4zM50 15.2c-7.7 0-14.9 2.2-21 6v23.6c6.1 3.8 13.3 6 21 6s14.9-2.2 21-6V21.2c-6.1-3.8-13.3-6-21-6z"/>
            </svg>
          </div>
        </Link>

        {/* Title */}
        <div className="px-2 mb-6">
          <h1 className="font-heading text-xl text-white">Admin Center</h1>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#30363d] mb-4" />

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? "bg-purple-500/15 text-purple-400"
                    : "text-[#7d8590] hover:bg-[#21262d] hover:text-[#e6edf3]"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-purple-400" : ""}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className="pt-4 border-t border-[#30363d]">
          <div className="px-2">
            <UserMenu user={session.user} />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-[#30363d] px-8 py-4 flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2 text-sm text-[#7d8590]">
            <Link href="/admin" className="hover:text-[#e6edf3]">Admin Center</Link>
            {pathname !== "/admin" && (
              <>
                <span>/</span>
                <span className="text-[#e6edf3]">
                  {navItems.find(item => pathname.startsWith(item.href) && item.href !== "/admin")?.label || "Dashboard"}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#7d8590]">
              {session.user.name}
            </span>
          </div>
        </header>
        <main className="flex-1 p-8 bg-[#0d1117]">{children}</main>
      </div>
    </div>
  );
}
