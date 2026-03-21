"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth/auth-client";
import Image from "next/image";

export default function SignupPage() {
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);


  const handleGoogle = async () => {
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
          setError("Google signup failed");
        },
      }
    );
  };


  const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("email");
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await signUp.email(
      {
        email,
        password,
        name: email,
        callbackURL: "/dashboard",
      },
      {
        onResponse: () => setLoading(null),
        onError: () => {
          setLoading(null);
          setError("Signup failed");
        },
      }
    );
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex gap-3 text-xl">
        <Link href="/auth/login">
          <p className="text-muted-foreground">login</p>
        </Link>
        <p>signup</p>
      </div>

      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="megan@fox.com"
            required
            className="border-b border-muted-foreground rounded-none"
          />
        </div>

        <div>
          <Label>Password</Label>
          <Input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="border-b border-muted-foreground rounded-none"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button type="submit" disabled={loading !== null} className="w-full">
          {loading === "email" ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="flex items-center justify-center gap-3 text-xs text-neutral-400">
        or
      </div>

      <button
        disabled={loading !== null}
        onClick={handleGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-800 py-3"
      >
        {loading === "google" ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Image
            src="/google.svg"
            alt="Google"
            height={20}
            width={20}
            className="w-5"
          />
        )}
        Continue with Google
      </button>
    </div>
  );
}