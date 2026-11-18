import { NextResponse } from "next/server";

import {
  convertPage,
  ConvertError,
  isHttpUrl,
} from "@/lib/url-to-markdown/convert-page";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!isHttpUrl(url)) {
    return NextResponse.json(
      { error: "http:// 또는 https://로 시작하는 웹 페이지 주소를 입력해 주세요." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await convertPage(url));
  } catch (error) {
    const message =
      error instanceof ConvertError
        ? error.message
        : "본문을 변환하는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
