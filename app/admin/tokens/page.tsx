"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Key, RefreshCw, Copy, Check, Eye, EyeOff, Loader2 } from "lucide-react";

interface TokenInfo {
  type: string;
  label: string;
  configured: boolean;
  updatedAt: string | null;
}

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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Token Management</h2>
        <p className="text-muted-foreground">
          Manage access tokens for each community type. Share these tokens with community leaders.
        </p>
      </div>

      {/* New token display */}
      {newToken && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">New Token Generated</CardTitle>
            <CardDescription className="text-green-700">
              Copy this token now. It won&apos;t be shown again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  value={showToken ? newToken.token : "•".repeat(32)}
                  readOnly
                  className="pr-10 font-mono"
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={copyToken} variant="outline">
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-green-700">
              Token for: <strong>{tokens.find((t) => t.type === newToken.type)?.label}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Token list */}
      <div className="grid gap-4">
        {tokens.map((token) => (
          <Card key={token.type}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{token.label}</p>
                  <p className="text-sm text-muted-foreground">Type: {token.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {token.configured ? (
                  <Badge variant="default" className="bg-green-500">
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not configured</Badge>
                )}
                {token.updatedAt && (
                  <span className="text-sm text-muted-foreground">
                    Updated: {new Date(token.updatedAt).toLocaleDateString()}
                  </span>
                )}
                <Button
                  onClick={() => regenerateToken(token.type)}
                  disabled={regenerating === token.type}
                  variant={token.configured ? "outline" : "default"}
                >
                  {regenerating === token.type ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {token.configured ? "Regenerate" : "Generate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> When you regenerate a token, the old token immediately becomes invalid.
            Make sure to distribute the new token to your community leaders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
