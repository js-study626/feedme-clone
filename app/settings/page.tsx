import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileForm } from "@/components/auth/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  // proxy.ts가 1차로 막지만, 페이지에서도 서버가 검증한 신원으로 다시 확인한다.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/auth/login?next=%2Fsettings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", data.claims.sub)
    .maybeSingle();

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">설정</CardTitle>
          <CardDescription>{data.claims.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm displayName={profile?.display_name ?? ""} />
        </CardContent>
      </Card>
      <div className="flex items-center justify-between text-sm">
        <Link href="/" className="underline underline-offset-4">
          홈으로
        </Link>
        <LogoutButton />
      </div>
    </main>
  );
}
