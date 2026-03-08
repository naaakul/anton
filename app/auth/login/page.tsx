"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/auth-client";

export default function LoginPage() {
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading("email");
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await signIn.email(
      {
        email,
        password,
        callbackURL: "/dashboard",
      },
      {
        onResponse: () => setLoading(null),
        onError: () => {
          setLoading(null);
          setError("Invalid email or password");
        },
      }
    );
  }

  async function handleGoogleSignIn() {
    setError(null);

    await signIn.social(
      {
        provider: "google",
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => setLoading("google"),
        onResponse: () => setLoading(null),
        onError: () => {
          setLoading(null);
          setError("Google login failed");
        },
      }
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm space-y-6">
        {/* Tabs */}
        <div className="flex justify-center gap-6 text-sm">
          <span className="border-b border-white pb-1">sign in</span>
          <a
            href="/auth/signup"
            className="text-muted-foreground hover:text-white"
          >
            sign up
          </a>
        </div>

        {/* Email / Password */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs text-muted-foreground">
              Email ID
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="border-0 border-b border-muted bg-transparent px-0 focus-visible:ring-0"
              placeholder="example@example.com"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs text-muted-foreground">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="border-0 border-b border-muted bg-transparent px-0 focus-visible:ring-0"
              placeholder="password"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={loading !== null}
            className="w-full bg-white text-black hover:bg-neutral-200"
          >
            {loading === "email" ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-muted" />
          or
          <div className="h-px flex-1 bg-muted" />
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="outline"
          disabled={loading !== null}
          className="w-full border-muted bg-transparent text-white hover:bg-white/5"
          onClick={handleGoogleSignIn}
        >
          {loading === "google" ? "Redirecting..." : "Continue with Google"}
        </Button>
      </div>
    </div>
  );
}