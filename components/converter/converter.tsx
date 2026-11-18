"use client";

import { useState } from "react";
import {
  ArrowUpRightIcon,
  CircleAlertIcon,
  ClipboardPasteIcon,
  CopyIcon,
  DownloadIcon,
  FileTextIcon,
  Link2Icon,
  Loader2Icon,
  SearchXIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { MarkdownView } from "@/components/converter/markdown-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  buildExportDocument,
  buildFileName,
  buildLlmText,
  LLM_TARGETS,
  planLlmOpen,
  type Article,
  type LlmKind,
} from "@/lib/url-to-markdown/export-document";

const PRESETS = ["요약해줘", "한국어로 번역해줘", "쉽게 설명해줘"];
const CUSTOM = "custom";
const URL_ERROR = "http:// 또는 https://로 시작하는 웹 페이지 주소를 입력해 주세요.";
const CHIP =
  "aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary";

type View =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "empty" }
  | { kind: "result"; article: Article };

function isValidUrl(value: string) {
  try {
    const u = new URL(value);
    return (
      (u.protocol === "http:" || u.protocol === "https:") &&
      u.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function Converter() {
  const [url, setUrl] = useState("");
  const [fieldError, setFieldError] = useState(false);
  const [view, setView] = useState<View>({ kind: "idle" });
  const [prompt, setPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

  const loading = view.kind === "loading";
  const article = view.kind === "result" ? view.article : null;

  async function convert(e: React.SyntheticEvent) {
    e.preventDefault();
    const value = url.trim();
    if (!value || loading) return;
    if (!isValidUrl(value)) {
      setFieldError(true);
      return;
    }
    setFieldError(false);
    setView({ kind: "loading" });
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setView({ kind: "error", message: data.error ?? "변환에 실패했습니다." });
      } else if (!data.markdown) {
        setView({ kind: "empty" });
      } else {
        setView({ kind: "result", article: data });
      }
    } catch {
      setView({
        kind: "error",
        message: "서버에 연결하지 못했습니다. 네트워크 상태를 확인해 주세요.",
      });
    }
  }

  function reset() {
    setUrl("");
    setFieldError(false);
    setView({ kind: "idle" });
    setPrompt(null);
    setCustomPrompt("");
  }

  const promptText = prompt === CUSTOM ? customPrompt.trim() : (prompt ?? "");

  async function copy() {
    if (!article) return;
    if (await writeClipboard(buildExportDocument(article))) {
      toast.success("Markdown을 복사했습니다");
    } else {
      toast.error("클립보드에 복사하지 못했습니다");
    }
  }

  function download() {
    if (!article) return;
    const name = buildFileName(article.title);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([buildExportDocument(article)], {
        type: "text/markdown;charset=utf-8",
      }),
    );
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast.success("파일을 저장했습니다", { description: name });
  }

  async function openLlm(kind: LlmKind) {
    if (!article) return;
    const plan = planLlmOpen(kind, buildLlmText(article, promptText));
    if (plan.mode === "url") {
      window.open(plan.url, "_blank", "noopener");
      return;
    }
    if (!(await writeClipboard(plan.text))) {
      toast.error("클립보드에 복사하지 못했습니다", {
        description:
          "브라우저가 클립보드 접근을 막았습니다. 복사하기 버튼을 다시 눌러 주세요.",
      });
      return;
    }
    window.open(plan.url, "_blank", "noopener");
    toast("본문을 클립보드에 복사했습니다. 입력창에 붙여넣으세요", {
      description: `${LLM_TARGETS[kind].name} 입력창에 Ctrl+V / ⌘V로 붙여넣으면 됩니다.`,
      icon: <ClipboardPasteIcon className="size-4" />,
      duration: 7000,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-[26px]">
          웹 페이지를 LLM에 바로 넣을 Markdown으로
        </h1>
        <p className="text-muted-foreground">
          URL을 붙여넣으면 광고와 메뉴를 걷어낸 본문만 뽑아 드립니다.
        </p>
      </div>

      <form onSubmit={convert} noValidate className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <InputGroup className="h-10 flex-1">
            <InputGroupAddon>
              <Link2Icon />
            </InputGroupAddon>
            <InputGroupInput
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://example.com/article"
              aria-label="변환할 웹 페이지 URL"
              aria-invalid={fieldError}
              aria-describedby={fieldError ? "url-error" : undefined}
              value={url}
              readOnly={loading}
              onChange={(e) => {
                setUrl(e.target.value);
                setFieldError(false);
              }}
            />
            {url && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label="지우기"
                  title="지우기"
                  onClick={reset}
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <Button type="submit" size="lg" disabled={loading || !url.trim()}>
            {loading && <Loader2Icon className="animate-spin" />}
            {loading ? "변환 중…" : "변환하기"}
          </Button>
        </div>
        {fieldError && (
          <p id="url-error" className="text-[13px] text-destructive">
            {URL_ERROR}
          </p>
        )}
      </form>

      <Card size="sm">
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p
              id="prompt-label"
              className="text-[13px] font-medium text-muted-foreground"
            >
              LLM에 함께 보낼 프롬프트{" "}
              <span className="font-normal">(선택)</span>
            </p>
            <ToggleGroup
              variant="outline"
              spacing={1.5}
              className="flex-wrap"
              aria-labelledby="prompt-label"
              value={prompt ? [prompt] : []}
              onValueChange={(v) => setPrompt(v[0] ?? null)}
            >
              {PRESETS.map((p) => (
                <ToggleGroupItem key={p} value={p} className={CHIP}>
                  {p}
                </ToggleGroupItem>
              ))}
              <ToggleGroupItem value={CUSTOM} className={CHIP}>
                직접 입력
              </ToggleGroupItem>
            </ToggleGroup>
            {prompt === CUSTOM && (
              <Input
                autoFocus
                placeholder="예: 핵심 주장 3가지와 반론을 정리해줘"
                aria-label="직접 입력 프롬프트"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            )}
          </div>
          <div className="grid grid-cols-2 items-center gap-2 border-t pt-4 sm:flex sm:flex-wrap">
            <Button variant="outline" disabled={!article} onClick={copy}>
              <CopyIcon data-icon="inline-start" />
              복사하기
            </Button>
            <Button variant="outline" disabled={!article} onClick={download}>
              <DownloadIcon data-icon="inline-start" />
              .md 다운로드
            </Button>
            <span className="hidden flex-1 sm:block" />
            <Button disabled={!article} onClick={() => openLlm("chatgpt")}>
              ChatGPT로 열기
              <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
            <Button disabled={!article} onClick={() => openLlm("claude")}>
              Claude로 열기
              <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {view.kind === "idle" && (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>변환 결과가 여기에 표시됩니다</EmptyTitle>
            <EmptyDescription>
              블로그 글, 뉴스 기사, 문서 페이지처럼 본문이 있는 주소에서 가장 잘
              동작합니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {view.kind === "loading" && (
        <Card aria-busy="true" role="status" aria-label="변환 중">
          <CardHeader className="gap-2.5">
            <Skeleton className="h-3.5 w-30" />
            <Skeleton className="h-6 w-[70%]" />
            <Skeleton className="h-3.5 w-[40%]" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            <Skeleton className="h-3.5" />
            <Skeleton className="h-3.5 w-[94%]" />
            <Skeleton className="h-3.5 w-[80%]" />
            <Skeleton className="mt-3 h-4 w-[36%]" />
            <Skeleton className="h-3.5" />
            <Skeleton className="h-3.5 w-[62%]" />
          </CardContent>
        </Card>
      )}

      {view.kind === "error" && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>페이지를 가져오지 못했습니다</AlertTitle>
          <AlertDescription>{view.message}</AlertDescription>
        </Alert>
      )}

      {view.kind === "empty" && (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>본문을 찾지 못했습니다</EmptyTitle>
            <EmptyDescription>
              페이지는 열렸지만 읽을 만한 본문이 없었습니다. 로그인이 필요하거나
              자바스크립트로만 내용을 그리는 페이지일 수 있습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {article && (
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-5">
            <CardTitle className="font-heading text-[22px] leading-snug text-balance">
              {article.title}
            </CardTitle>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
              {article.author && (
                <span className="font-medium text-foreground">
                  {article.author}
                </span>
              )}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all underline underline-offset-3"
              >
                {article.url.replace(/^https?:\/\//, "")}
              </a>
            </div>
          </CardHeader>
          <MarkdownView markdown={article.markdown} />
        </Card>
      )}
    </div>
  );
}
