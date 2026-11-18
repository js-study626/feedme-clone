@AGENTS.md

# 디스크 사용 (C: 드라이브 여유 없음)

C: 드라이브가 가득 차 있어 C:에 쓰면 `ENOSPC`로 실패한다. 모든 작업은 D:에서 한다.

- 패키지 설치·빌드 등 쓰기 작업 전에 캐시와 임시 폴더를 D:로 돌린다. bash 기준: `export BUN_INSTALL_CACHE_DIR=D:/Study/.cache/bun BUN_TMPDIR=D:/Study/.cache/tmp TMP=D:/Study/.cache/tmp TEMP=D:/Study/.cache/tmp TMPDIR=D:/Study/.cache/tmp`
- 캐시·임시 파일·산출물을 C:에 새로 만들지 않는다.
