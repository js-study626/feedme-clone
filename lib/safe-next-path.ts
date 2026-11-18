// 같은 출처의 경로만 리다이렉트 대상으로 허용한다.
export const safeNextPath = (path: unknown, fallback = "/") => {
  if (typeof path !== "string" || !path.startsWith("/")) return fallback;

  const origin = window.location.origin;
  try {
    const url = new URL(path, origin);
    return url.origin === origin
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
};
