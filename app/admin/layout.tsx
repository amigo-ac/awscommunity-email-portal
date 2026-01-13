import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserMenu } from "@/components/user-menu";
import Link from "next/link";
import { Mail, Key, Users, FileText, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tokens", label: "Tokens", icon: Key },
  { href: "/admin/accounts", label: "Accounts", icon: Users },
  { href: "/admin/logs", label: "Audit Logs", icon: FileText },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 p-4">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <Mail className="h-6 w-6 text-orange-500" />
          <span className="font-semibold">AWS Community MX</span>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <UserMenu user={session.user} />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
