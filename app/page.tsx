import { Converter } from "@/components/converter/converter";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="break-keep mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <span className="grid size-6 place-items-center rounded-md bg-primary font-mono text-xs text-primary-foreground">
            md
          </span>
          feedme
        </div>
        <ThemeToggle />
      </header>
      <Converter />
    </main>
  );
}
