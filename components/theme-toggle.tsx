"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  // 서버 렌더링과 어긋나지 않도록 아이콘은 CSS(dark:)로 전환하고, 클릭 시점에 현재 값을 읽는다.
  function toggle() {
    const dark = document.documentElement.classList.contains("dark");
    setTheme(dark ? "light" : "dark");
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="화면 모드 전환"
      title="화면 모드 전환"
      onClick={toggle}
    >
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </Button>
  );
}
