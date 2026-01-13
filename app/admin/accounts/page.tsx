"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, ChevronLeft, ChevronRight, Users, Trash2, AlertTriangle } from "lucide-react";

interface Account {
  id: number;
  email: string;
  type: string;
  username: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  alternativeEmail: string;
  googleDisplayName: string | null;
  createdAt: string;
}

const communityTypes = [
  { value: "all", label: "All Types" },
  { value: "cc", label: "Cloud Club" },
  { value: "ug", label: "User Group" },
  { value: "cb", label: "Community Builder" },
  { value: "hero", label: "Hero" },
];

const typeColors: Record<string, { bg: string; text: string }> = {
  cc: { bg: "bg-purple-500/20", text: "text-purple-400" },
  ug: { bg: "bg-amber-500/20", text: "text-amber-400" },
  cb: { bg: "bg-green-500/20", text: "text-green-400" },
  hero: { bg: "bg-pink-500/20", text: "text-pink-400" },
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (type && type !== "all") params.set("type", type);
      params.set("page", page.toString());

      const res = await fetch(`/api/admin/accounts?${params}`);
      const data = await res.json();
      setAccounts(data.accounts);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [page, type]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAccounts();
  };

  const handleDelete = async () => {
    if (!accountToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/admin/accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: accountToDelete.id,
          email: accountToDelete.email,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDeleteModalOpen(false);
        setAccountToDelete(null);
        fetchAccounts();
      } else {
        setDeleteError(data.error || "Failed to delete account");
      }
    } catch {
      setDeleteError("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (account: Account) => {
    setAccountToDelete(account);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setAccountToDelete(null);
    setDeleteError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-[#e6edf3]">Accounts</h2>
          <p className="text-[#7d8590]">
            View all created email accounts ({total} total)
          </p>
        </div>
        <div className="p-3 rounded-lg bg-purple-500/10">
          <Users className="h-5 w-5 text-purple-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8590]" />
            <Input
              placeholder="Search by email, name, or contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#0d1117] border-[#30363d] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-purple-500"
            />
          </div>
          <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
            <SelectTrigger className="w-48 bg-[#0d1117] border-[#30363d] text-[#e6edf3]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] border-[#30363d]">
              {communityTypes.map((t) => (
                <SelectItem
                  key={t.value}
                  value={t.value}
                  className="text-[#7d8590] focus:bg-[#21262d] focus:text-[#e6edf3]"
                >
                  {t.label}
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
        ) : accounts.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-[#7d8590]">
            No accounts found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#0d1117]">
                  <th className="text-left p-4 text-sm font-medium text-[#7d8590]">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-[#7d8590]">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-[#7d8590]">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-[#7d8590]">Contact Email</th>
                  <th className="text-left p-4 text-sm font-medium text-[#7d8590]">Created At</th>
                  <th className="text-left p-4 text-sm font-medium text-[#7d8590]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => {
                  const colors = typeColors[account.type] || { bg: "bg-gray-500/20", text: "text-gray-400" };
                  return (
                    <tr
                      key={account.id}
                      className="border-b border-[#21262d] hover:bg-[#21262d] transition-colors"
                    >
                      <td className="p-4 font-mono text-sm text-[#e6edf3]">{account.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                          {account.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-[#7d8590]">
                        {account.firstName} {account.lastName && `(${account.lastName})`}
                      </td>
                      <td className="p-4 text-[#7d8590]">{account.alternativeEmail}</td>
                      <td className="p-4 text-[#484f58] text-sm">
                        {new Date(account.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => openDeleteModal(account)}
                          className="p-2 text-[#7d8590] hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-[#e6edf3]">Delete Account</h3>
            </div>

            <p className="text-[#7d8590] mb-4">
              Are you sure you want to delete this account? This action will:
            </p>

            <ul className="text-sm text-[#7d8590] mb-4 space-y-1 list-disc list-inside">
              <li>Remove the user from Google Workspace</li>
              <li>Delete all associated data from the database</li>
              <li>This action cannot be undone</li>
            </ul>

            {accountToDelete && (
              <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-3 mb-4">
                <p className="font-mono text-sm text-[#e6edf3]">{accountToDelete.email}</p>
                <p className="text-xs text-[#7d8590] mt-1">
                  {accountToDelete.firstName} {accountToDelete.lastName}
                </p>
              </div>
            )}

            {deleteError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 mb-4">
                <p className="text-sm text-red-400">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#30363d] rounded-md text-sm text-[#e6edf3] hover:border-[#e6edf3] hover:bg-[#e6edf3]/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
