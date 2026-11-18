export type Article = {
  title: string;
  author: string;
  url: string;
  markdown: string;
};

export type LlmKind = "chatgpt" | "claude";

export const OPEN_URL_LIMIT = 8000;

export const LLM_TARGETS: Record<
  LlmKind,
  { name: string; base: string; blank: string }
> = {
  chatgpt: {
    name: "ChatGPT",
    base: "https://chatgpt.com/?q=",
    blank: "https://chatgpt.com/",
  },
  claude: {
    name: "Claude",
    base: "https://claude.ai/new?q=",
    blank: "https://claude.ai/new",
  },
};

/** 복사·다운로드·LLM 전달이 함께 쓰는 문서. */
export function buildExportDocument(article: Article): string {
  const lines = [`# ${article.title}`, ""];
  if (article.author) lines.push(`저자: ${article.author}`);
  lines.push(`출처: ${article.url}`, "", article.markdown, "");
  return lines.join("\n");
}

export function buildFileName(title: string): string {
  const cleaned = title
    .replace(/[\/:*?"<>|\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return `${cleaned || "page"}.md`;
}

/** 프롬프트가 있으면 앞에 붙인다. 빈 프롬프트는 없는 것과 같다. */
export function buildLlmText(article: Article, prompt: string): string {
  const doc = buildExportDocument(article);
  const trimmed = prompt.trim();
  return trimmed ? `${trimmed}\n\n${doc}` : doc;
}

export type LlmPlan =
  | { mode: "url"; url: string }
  | { mode: "clipboard"; text: string; url: string };

export function planLlmOpen(kind: LlmKind, text: string): LlmPlan {
  const target = LLM_TARGETS[kind];
  const url = target.base + encodeURIComponent(text);
  if (url.length <= OPEN_URL_LIMIT) return { mode: "url", url };
  return { mode: "clipboard", text, url: target.blank };
}
