import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

export type ConvertedPage = {
  title: string;
  author: string;
  url: string;
  markdown: string;
};

export class ConvertError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConvertError";
  }
}

export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export async function convertPage(url: string): Promise<ConvertedPage> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; feedme/1.0)",
        accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ConvertError(
      "서버에서 해당 주소에 연결하지 못했습니다. 주소가 맞는지, 사이트가 열려 있는지 확인해 주세요.",
    );
  }

  if (!response.ok) {
    throw new ConvertError(
      `서버가 ${response.status} ${response.statusText}`.trim() +
        "(으)로 응답했습니다. 주소가 맞는지, 로그인 없이 열리는 페이지인지 확인해 주세요.",
    );
  }

  const html = await response.text();
  const { document } = parseHTML(html);
  const result = await Defuddle(document as unknown as Document, response.url || url, {
    markdown: true,
  });

  return {
    title: (result.title || "").trim() || new URL(url).hostname,
    author: (result.author || "").trim(),
    url,
    markdown: (result.content || "").trim(),
  };
}
