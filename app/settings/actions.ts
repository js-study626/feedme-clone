"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { ok: boolean; message: string } | null;

export async function updateDisplayName(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  if (displayName.length > 50) {
    return { ok: false, message: "이름은 50자 이하로 입력하세요." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  // RLS가 본인 행만 갱신하도록 막는다. 갱신된 행이 없으면 실패로 본다.
  const { data: rows, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, updated_at: new Date().toISOString() })
    .eq("id", data.claims.sub)
    .select("id");

  if (error || !rows?.length) {
    return { ok: false, message: "저장하지 못했습니다." };
  }

  revalidatePath("/settings");
  return { ok: true, message: "저장했습니다." };
}
