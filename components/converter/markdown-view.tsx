/* eslint-disable @typescript-eslint/no-unused-vars -- react-markdown의 node prop이 DOM으로 새지 않게 떼어 낸다 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const PROSE =
  "px-4 py-5 text-[15px] leading-7 wrap-anywhere sm:px-6 " +
  "[&>:first-child]:mt-0 " +
  "[&_h1]:mt-7 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold " +
  "[&_h2]:mt-7 [&_h2]:mb-2.5 [&_h2]:text-lg [&_h2]:font-semibold " +
  "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold " +
  "[&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:font-semibold " +
  "[&_p]:mb-3.5 [&_ul]:mb-3.5 [&_ul]:list-disc [&_ul]:pl-6 " +
  "[&_ol]:mb-3.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 " +
  "[&_a]:underline [&_a]:underline-offset-3 " +
  "[&_blockquote]:mb-3.5 [&_blockquote]:border-l-[3px] [&_blockquote]:border-border [&_blockquote]:pl-3.5 [&_blockquote]:text-muted-foreground " +
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-px [&_code]:font-mono [&_code]:text-[0.88em] " +
  "[&_pre]:mb-3.5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-4 " +
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[13px] " +
  "[&_img]:h-auto [&_img]:max-w-full [&_hr]:my-6 [&_hr]:border-border";

// raw HTML을 렌더링하지 않으므로(rehype-raw 없음) 원본 페이지의 스크립트는 실행되지 않는다.
export function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <div className={PROSE}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node: _node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          table: ({ node: _node, ...props }) => (
            <div className="mb-3.5 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          th: ({ node: _node, ...props }) => (
            <th
              className="border border-border bg-muted px-2.5 py-1.5 text-left font-semibold"
              {...props}
            />
          ),
          td: ({ node: _node, ...props }) => (
            <td
              className="border border-border px-2.5 py-1.5 text-left align-top"
              {...props}
            />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
