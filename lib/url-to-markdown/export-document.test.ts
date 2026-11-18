import { expect, test } from "vitest";

import {
  buildExportDocument,
  buildFileName,
  buildLlmText,
  OPEN_URL_LIMIT,
  planLlmOpen,
} from "./export-document";

const article = {
  title: "제목",
  author: "",
  url: "https://example.com/a",
  markdown: "본문",
};

test("저자가 없으면 저자 줄이 문서에 들어가지 않는다", () => {
  expect(buildExportDocument(article)).toBe(
    "# 제목\n\n출처: https://example.com/a\n\n본문\n",
  );
  expect(buildExportDocument({ ...article, author: "홍길동" })).toContain(
    "저자: 홍길동\n출처:",
  );
});

test("파일 이름에서 쓸 수 없는 문자를 뺀다", () => {
  expect(buildFileName('a/b:c*d?"e<f>g|h')).toBe("abcdefgh.md");
  expect(buildFileName("///")).toBe("page.md");
});

test("프롬프트는 빈 줄을 두고 문서 앞에 붙고, 비어 있으면 붙지 않는다", () => {
  const doc = buildExportDocument(article);
  expect(buildLlmText(article, "요약해줘")).toBe(`요약해줘\n\n${doc}`);
  expect(buildLlmText(article, "   ")).toBe(doc);
});

test("열기 주소가 기준 길이 이하면 주소에 담고, 넘으면 클립보드 경로를 쓴다", () => {
  const short = planLlmOpen("chatgpt", "안녕");
  expect(short).toEqual({
    mode: "url",
    url: `https://chatgpt.com/?q=${encodeURIComponent("안녕")}`,
  });
  const long = planLlmOpen("claude", "가".repeat(OPEN_URL_LIMIT));
  expect(long.mode).toBe("clipboard");
  expect(long.url).toBe("https://claude.ai/new");
});
