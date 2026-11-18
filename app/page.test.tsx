import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import Home from "@/app/page";

// AuthNav는 서버에서 세션을 읽는 비동기 컴포넌트라 이 단위 테스트에서는 비워 둔다.
vi.mock("@/components/auth/auth-nav", () => ({ AuthNav: () => null }));

test("처음 화면은 URL 입력란과 비활성 변환·내보내기 버튼을 보여준다", () => {
  render(<Home />);

  expect(screen.getByLabelText("변환할 웹 페이지 URL")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "변환하기" })).toBeDisabled();
  for (const name of ["복사하기", ".md 다운로드", "ChatGPT로 열기", "Claude로 열기"]) {
    expect(screen.getByRole("button", { name })).toBeDisabled();
  }
});
