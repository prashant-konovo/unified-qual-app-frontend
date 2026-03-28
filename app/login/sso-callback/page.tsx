"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function SSOCallbackPage() {
  const searchParams = useSearchParams();
  const { loginWithCode } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("Missing authorization code");
      return;
    }

    const redirectUri = `${window.location.origin}/login/sso-callback`;

    loginWithCode(code, redirectUri).catch((err) => {
      const axiosErr = err as {
        response?: { data?: { error?: string } };
      };
      setError(
        axiosErr?.response?.data?.error ??
          (err instanceof Error ? err.message : "SSO login failed"),
      );
    });
  }, [searchParams, loginWithCode]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg font-medium">{error}</p>
          <a className="text-sm underline" href="/login">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Completing sign in…</span>
      </div>
    </div>
  );
}
