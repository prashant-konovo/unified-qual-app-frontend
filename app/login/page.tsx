"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import apiClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Image from "next/image";

function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/projects";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, redirectTo);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      // Surface backend error message if available
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
      setError(
        axiosErr?.response?.data?.message ??
          axiosErr?.response?.data?.error ??
          msg,
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSSO() {
    setSsoLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/auth/sso/config");
      const { authorizeUrl } = res.data?.data ?? res.data ?? {};
      if (!authorizeUrl) {
        setError("SSO is not configured");
        return;
      }
      window.location.href = authorizeUrl;
    } catch {
      setError("Failed to initiate SSO login");
      setSsoLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-2">
            <Image
              alt="Konovo logo"
              className="object-contain"
              height={48}
              src="/logo.png"
              width={48}
            />
          </div>
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access Unified Qual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                autoComplete="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@konovo.com"
                required
                type="email"
                value={email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                autoComplete="current-password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                value={password}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button className="w-full" disabled={loading} type="submit">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            className="w-full"
            disabled={ssoLoading}
            onClick={handleSSO}
            type="button"
            variant="outline"
          >
            {ssoLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting…
              </>
            ) : (
              "Sign in with SSO"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
