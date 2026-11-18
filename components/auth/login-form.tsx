"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { safeNextPath } from "@/lib/safe-next-path";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next");
    router.push(safeNextPath(next, "/"));
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">로그인</CardTitle>
        <CardDescription>이메일과 비밀번호를 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "로그인 중…" : "로그인"}
          </Button>
          <p className="text-center text-sm">
            계정이 없나요?{" "}
            <Link href="/auth/sign-up" className="underline underline-offset-4">
              회원가입
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
