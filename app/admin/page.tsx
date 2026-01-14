import { db, accounts, auditLogs, tokens } from "@/lib/db";
import { Key, Users, FileText, Clock, TrendingUp } from "lucide-react";
import { desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Get stats
  const [accountStats] = await db
    .select({ count: sql<number>`count(*)` })
    .from(accounts);

  const [logStats] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs);

  const [tokenStats] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tokens);

  // Get recent accounts
  const recentAccounts = await db
    .select()
    .from(accounts)
    .orderBy(desc(accounts.createdAt))
    .limit(5);

  // Get recent logs
  const recentLogs = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(5);

  const stats = [
    {
      label: "Total Accounts",
      value: accountStats?.count ?? 0,
      description: "Email addresses created",
      icon: Users,
      color: "#a855f7",
    },
    {
      label: "Active Tokens",
      value: tokenStats?.count ?? 0,
      description: "Community type tokens",
      icon: Key,
      color: "#22c55e",
    },
    {
      label: "Audit Logs",
      value: logStats?.count ?? 0,
      description: "Total log entries",
      icon: FileText,
      color: "#22d3ee",
    },
  ];

  const typeColors: Record<string, { bg: string; text: string }> = {
    cc: { bg: "bg-purple-500/20", text: "text-purple-400" },
    ug: { bg: "bg-amber-500/20", text: "text-amber-400" },
    cb: { bg: "bg-green-500/20", text: "text-green-400" },
    hero: { bg: "bg-pink-500/20", text: "text-pink-400" },
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl text-[#e6edf3]">Dashboard</h2>
        <p className="text-[#7d8590]">Overview of the email portal</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-lg bg-[#161b22] border border-[#30363d] p-6"
          >
            {/* Color accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: stat.color }}
            />

            <div className="flex items-start justify-between pt-2">
              <div>
                <p className="text-sm text-[#7d8590]">{stat.label}</p>
                <p className="text-4xl font-heading text-[#e6edf3] mt-2">{stat.value}</p>
                <p className="text-xs text-[#7d8590] mt-1">{stat.description}</p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Accounts */}
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] overflow-hidden">
          <div className="p-6 border-b border-[#30363d]">
            <h3 className="text-lg font-medium text-[#e6edf3]">Recent Accounts</h3>
            <p className="text-sm text-[#7d8590]">Latest email addresses created</p>
          </div>
          <div className="p-4">
            {recentAccounts.length === 0 ? (
              <p className="text-sm text-[#7d8590] p-2">No accounts yet</p>
            ) : (
              <div className="space-y-2">
                {recentAccounts.map((account) => {
                  const colors = typeColors[account.type] || { bg: "bg-gray-500/20", text: "text-gray-400" };
                  return (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#0d1117] hover:bg-[#21262d] transition-colors"
                    >
                      <div>
                        <p className="font-mono text-sm text-[#e6edf3]">{account.email}</p>
                        <p className="text-xs text-[#7d8590] mt-0.5">
                          {account.firstName} • {account.alternativeEmail}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}
                      >
                        {account.type.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] overflow-hidden">
          <div className="p-6 border-b border-[#30363d]">
            <h3 className="text-lg font-medium text-[#e6edf3]">Recent Activity</h3>
            <p className="text-sm text-[#7d8590]">Latest audit log entries</p>
          </div>
          <div className="p-4">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-[#7d8590] p-2">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[#0d1117] hover:bg-[#21262d] transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Clock className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#e6edf3]">{log.action}</p>
                      <p className="text-xs text-[#7d8590] truncate">
                        {log.actorEmail}
                      </p>
                      <p className="text-xs text-[#484f58] mt-1">
                        {log.createdAt?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
