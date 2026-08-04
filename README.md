# KINETIQ — Urban Micromobility Landing Page

Figma 레퍼런스(PUMA 온라인몰 디자인)의 그리드 구조(내비게이션 / 히어로 8-4 / 대형 워드 마퀴 / 인트로 5-7 / 라인업 3-3-3-3 갤러리 / 통계 4-4-4 / 문의 / 푸터 6-6)를 재현한 모빌리티 브랜드 원페이지 랜딩페이지입니다.
이미지 영역은 전부 `--color-placeholder`(#d9d9d9) 플레이스홀더로 처리했으며, CTA는 "문의하기" 버튼 하나만 존재합니다.

## Stack
- 순수 HTML/CSS/JS, 빌드 도구 없음
- `css/styles.css` — 디자인 토큰 & 그리드 시스템 (수정 금지)
- `css/site.css` — KINETIQ 전용 컴포넌트 스타일
- `js/main.js` — 내비게이션 스크롤 상태, 통계 카운트업

## 로컬 실행
정적 파일이므로 `index.html`을 브라우저에서 바로 열거나, 아래처럼 로컬 서버로 실행합니다.

```bash
python3 -m http.server 5500
```

## 배포
`main` 브랜치에 푸시하면 GitHub Actions(`.github/workflows/deploy.yml`)가 자동으로 GitHub Pages에 배포합니다.
