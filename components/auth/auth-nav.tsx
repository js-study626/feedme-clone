import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function AuthNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return data?.claims ? (
    <Link href="/settings" className={buttonVariants({ variant: "ghost", size: "sm" })}>
      설정
    </Link>
  ) : (
    <Link href="/auth/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
      로그인
    </Link>
  );
}
