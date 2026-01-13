import { db, accounts, auditLogs, tokens } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, Users, FileText, Clock } from "lucide-react";
import { desc, sql } from "drizzle-orm";

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Overview of the email portal</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountStats?.count ?? 0}</div>
            <p className="text-xs text-muted-foreground">Email addresses created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenStats?.count ?? 0}</div>
            <p className="text-xs text-muted-foreground">Community type tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats?.count ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total log entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Accounts</CardTitle>
            <CardDescription>Latest email addresses created</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accounts yet</p>
            ) : (
              <div className="space-y-4">
                {recentAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm">{account.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {account.firstName} - {account.alternativeEmail}
                      </p>
                    </div>
                    <Badge variant="outline">{account.type.toUpperCase()}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest audit log entries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.actorEmail} • {log.createdAt?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
