"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, ChevronLeft, ChevronRight, FileText } from "lucide-react";

interface AuditLog {
  id: number;
  action: string;
  actorEmail: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

const actionColors: Record<string, { bg: string; text: string }> = {
  registration_success: { bg: "bg-green-500/20", text: "text-green-400" },
  registration_failed: { bg: "bg-red-500/20", text: "text-red-400" },
  token_validation_success: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  token_validation_failed: { bg: "bg-amber-500/20", text: "text-amber-400" },
  token_created: { bg: "bg-purple-500/20", text: "text-purple-400" },
  token_regenerated: { bg: "bg-purple-500/20", text: "text-purple-400" },
};

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (action && action !== "all") params.set("action", action);
      params.set("page", page.toString());

      const res = await fetch(`/api/admin/logs?${params}`);
      const data = await res.json();
      setLogs(data.logs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setActions(data.actions);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, action]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const formatDetails = (details: Record<string, unknown> | null) => {
    if (!details) return "-";
    return Object.entries(details)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-[#e6edf3]">Audit Logs</h2>
          <p className="text-[#7d8590]">
            View all system activity ({total} total entries)
          </p>
        </div>
        <div className="p-3 rounded-lg bg-cyan-500/10">
          <FileText className="h-5 w-5 text-cyan-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8590]" />
            <Input
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#0d1117] border-[#30363d] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-purple-500"
            />
          </div>
          <Select value={action} onValueChange={(v) => { setAction(v); setPage(1); }}>
            <SelectTrigger className="w-56 bg-[#0d1117] border-[#30363d] text-[#e6edf3]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] border-[#30363d]">
              <SelectItem
                value="all"
                className="text-[#7d8590] focus:bg-[#21262d] focus:text-[#e6edf3]"
              >
                All Actions
              </SelectItem>
              {actions.map((a) => (
                <SelectItem
                  key={a}
                  value={a}
                  className="text-[#7d8590] focus:bg-[#21262d] focus:text-[#e6edf3]"
                >
                  {a.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="submit"
            className="px-4 py-2 border border-[#30363d] rounded-md text-sm text-[#e6edf3] hover:border-[#e6edf3] hover:bg-[#e6edf3]/5 transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-[#7d8590]">
            No logs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#0d1117]">
                  <th className="text-left p-4 text-sm font-medium text-[#7d8590]">Timestamp</th>
                  <th className="text-left p-4 text-sm font-medium text-[#7d8590]">Action</th>
                  <th className="text-left p-4 text-sm font-medium text-[#7d8590]">Actor</th>
                  <th className="text-left p-4 text-sm font-medium text-[#7d8590]">Details</th>
                  <th className="text-left p-4 text-sm font-medium text-[#7d8590]">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const colors = actionColors[log.action] || { bg: "bg-gray-500/20", text: "text-gray-400" };
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-[#21262d] hover:bg-[#21262d] transition-colors"
                    >
                      <td className="p-4 text-[#484f58] whitespace-nowrap text-sm">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4 text-[#7d8590] text-sm">
                        {log.actorEmail}
                      </td>
                      <td className="p-4 max-w-xs truncate text-[#484f58] text-sm">
                        {formatDetails(log.details)}
                      </td>
                      <td className="p-4 text-[#484f58] text-sm font-mono">
                        {log.ipAddress || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#7d8590]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-[#30363d] rounded-md text-sm text-[#7d8590] hover:border-[#e6edf3] hover:text-[#e6edf3] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 border border-[#30363d] rounded-md text-sm text-[#7d8590] hover:border-[#e6edf3] hover:text-[#e6edf3] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
