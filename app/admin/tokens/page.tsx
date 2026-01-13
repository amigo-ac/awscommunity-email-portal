"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Key, RefreshCw, Copy, Check, Eye, EyeOff, Loader2, Shield } from "lucide-react";

interface TokenInfo {
  type: string;
  label: string;
  configured: boolean;
  updatedAt: string | null;
}

const typeColors: Record<string, { bg: string; text: string; color: string }> = {
  cc: { bg: "bg-purple-500/10", text: "text-purple-400", color: "#a855f7" },
  ug: { bg: "bg-amber-500/10", text: "text-amber-400", color: "#f59e0b" },
  cb: { bg: "bg-green-500/10", text: "text-green-400", color: "#22c55e" },
  hero: { bg: "bg-pink-500/10", text: "text-pink-400", color: "#ec4899" },
};

export default function TokensPage() {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<{ type: string; token: string } | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchTokens = async () => {
    try {
      const res = await fetch("/api/admin/tokens");
      const data = await res.json();
      setTokens(data.tokens);
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const regenerateToken = async (type: string) => {
    setRegenerating(type);
    setNewToken(null);
    try {
      const res = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.success) {
        setNewToken({ type, token: data.token });
        fetchTokens();
      }
    } catch (error) {
      console.error("Failed to regenerate token:", error);
    } finally {
      setRegenerating(null);
    }
  };

  const copyToken = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-[#e6edf3]">Token Management</h2>
          <p className="text-[#7d8590]">
            Manage access tokens for each community type. Share these tokens with community leaders.
          </p>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10">
          <Key className="h-5 w-5 text-green-400" />
        </div>
      </div>

      {/* New token display */}
      {newToken && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Shield className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-green-400">New Token Generated</h3>
              <p className="text-sm text-green-400/70">
                Copy this token now. It won&apos;t be shown again.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                value={showToken ? newToken.token : "•".repeat(32)}
                readOnly
                className="pr-12 font-mono bg-[#0d1117] border-green-500/30 text-[#e6edf3]"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-[#e6edf3] transition-colors"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              onClick={copyToken}
              className="px-3 py-2 border border-green-500/30 rounded-md text-green-400 hover:bg-green-500/10 transition-all"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-sm text-green-400/70 mt-3">
            Token for: <strong className="text-green-400">{tokens.find((t) => t.type === newToken.type)?.label}</strong>
          </p>
        </div>
      )}

      {/* Token list */}
      <div className="grid gap-4">
        {tokens.map((token) => {
          const colors = typeColors[token.type] || { bg: "bg-gray-500/10", text: "text-gray-400", color: "#6b7280" };
          return (
            <div
              key={token.type}
              className="relative rounded-lg bg-[#161b22] border border-[#30363d] p-6 hover:border-[#484f58] transition-colors overflow-hidden"
            >
              {/* Color accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: colors.color }}
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <Key className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <div>
                    <p className="font-medium text-[#e6edf3]">{token.label}</p>
                    <p className="text-sm text-[#7d8590]">Type: <span className={colors.text}>{token.type.toUpperCase()}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {token.configured ? (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                      Configured
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-500/20 text-gray-400">
                      Not configured
                    </span>
                  )}
                  {token.updatedAt && (
                    <span className="text-sm text-[#484f58]">
                      Updated: {new Date(token.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                  <button
                    onClick={() => regenerateToken(token.type)}
                    disabled={regenerating === token.type}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      token.configured
                        ? "border border-[#30363d] text-[#7d8590] hover:border-[#e6edf3] hover:text-[#e6edf3]"
                        : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                    } disabled:opacity-50`}
                  >
                    {regenerating === token.type ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {token.configured ? "Regenerate" : "Generate"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-6">
        <p className="text-sm text-[#7d8590]">
          <strong className="text-[#e6edf3]">Note:</strong> When you regenerate a token, the old token immediately becomes invalid.
          Make sure to distribute the new token to your community leaders.
        </p>
      </div>
    </div>
  );
}
