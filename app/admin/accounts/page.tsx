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
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  Trash2,
  AlertTriangle,
  Eye,
  X,
  MapPin,
  Building,
  Briefcase,
  Linkedin,
  Github,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Mail,
  Phone,
  Calendar,
  User,
} from "lucide-react";

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
  // Profile fields
  bio: string | null;
  location: string | null;
  profileImage: string | null;
  company: string | null;
  jobTitle: string | null;
  // Social networks
  linkedin: string | null;
  twitter: string | null;
  github: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  website: string | null;
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

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [accountToView, setAccountToView] = useState<Account | null>(null);

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
                  <th className="text-left p-4 text-sm font-medium text-[#7d8590] w-12"></th>
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
                      <td className="p-4">
                        {account.profileImage ? (
                          <img
                            src={account.profileImage}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#21262d] flex items-center justify-center">
                            <User className="w-4 h-4 text-[#484f58]" />
                          </div>
                        )}
                      </td>
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
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setAccountToView(account);
                              setViewModalOpen(true);
                            }}
                            className="p-2 text-[#7d8590] hover:text-purple-400 hover:bg-purple-500/10 rounded-md transition-colors"
                            title="View profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(account)}
                            className="p-2 text-[#7d8590] hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Delete account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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

      {/* View Profile Modal */}
      {viewModalOpen && accountToView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#30363d] sticky top-0 bg-[#161b22]">
              <h3 className="text-lg font-medium text-[#e6edf3]">Profile Details</h3>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setAccountToView(null);
                }}
                className="p-2 text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {accountToView.profileImage ? (
                    <img
                      src={accountToView.profileImage}
                      alt={`${accountToView.firstName}'s profile`}
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#30363d]"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#21262d] border-2 border-[#30363d] flex items-center justify-center">
                      <User className="w-10 h-10 text-[#484f58]" />
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-medium text-[#e6edf3]">
                    {accountToView.firstName} {accountToView.lastName}
                  </h4>
                  {accountToView.googleDisplayName && (
                    <p className="text-sm text-[#7d8590] mt-0.5">{accountToView.googleDisplayName}</p>
                  )}
                  <p className="font-mono text-sm text-purple-400 mt-1">{accountToView.email}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${typeColors[accountToView.type]?.bg || "bg-gray-500/20"} ${typeColors[accountToView.type]?.text || "text-gray-400"}`}>
                    {accountToView.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {accountToView.bio && (
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                  <p className="text-[#e6edf3] text-sm whitespace-pre-wrap">{accountToView.bio}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-[#7d8590] uppercase tracking-wide">Contact</h5>

                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-[#484f58]" />
                    <span className="text-[#e6edf3]">{accountToView.alternativeEmail}</span>
                  </div>

                  {accountToView.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-[#484f58]" />
                      <span className="text-[#e6edf3]">{accountToView.phone}</span>
                    </div>
                  )}

                  {accountToView.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-[#484f58]" />
                      <span className="text-[#e6edf3]">{accountToView.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-[#484f58]" />
                    <span className="text-[#7d8590]">Joined {new Date(accountToView.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Professional Info */}
                {(accountToView.company || accountToView.jobTitle) && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-[#7d8590] uppercase tracking-wide">Professional</h5>

                    {accountToView.company && (
                      <div className="flex items-center gap-3 text-sm">
                        <Building className="w-4 h-4 text-[#484f58]" />
                        <span className="text-[#e6edf3]">{accountToView.company}</span>
                      </div>
                    )}

                    {accountToView.jobTitle && (
                      <div className="flex items-center gap-3 text-sm">
                        <Briefcase className="w-4 h-4 text-[#484f58]" />
                        <span className="text-[#e6edf3]">{accountToView.jobTitle}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Social Networks */}
              {(accountToView.linkedin || accountToView.twitter || accountToView.github || accountToView.instagram || accountToView.facebook || accountToView.youtube || accountToView.website) && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-[#7d8590] uppercase tracking-wide">Social Networks</h5>
                  <div className="flex flex-wrap gap-2">
                    {accountToView.linkedin && (
                      <a
                        href={accountToView.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3] hover:border-[#0077b5] hover:text-[#0077b5] transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                    {accountToView.twitter && (
                      <a
                        href={accountToView.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3] hover:border-[#1da1f2] hover:text-[#1da1f2] transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Twitter/X
                      </a>
                    )}
                    {accountToView.github && (
                      <a
                        href={accountToView.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3] hover:border-[#e6edf3] transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                    {accountToView.instagram && (
                      <a
                        href={accountToView.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3] hover:border-[#e4405f] hover:text-[#e4405f] transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </a>
                    )}
                    {accountToView.facebook && (
                      <a
                        href={accountToView.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3] hover:border-[#1877f2] hover:text-[#1877f2] transition-colors"
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </a>
                    )}
                    {accountToView.youtube && (
                      <a
                        href={accountToView.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3] hover:border-[#ff0000] hover:text-[#ff0000] transition-colors"
                      >
                        <Youtube className="w-4 h-4" />
                        YouTube
                      </a>
                    )}
                    {accountToView.website && (
                      <a
                        href={accountToView.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3] hover:border-purple-400 hover:text-purple-400 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
