// KINETIQ landing — nav scroll state, hero 자동 슬라이드 전환 (마퀴는 CSS 애니메이션으로만 동작)
(function () {
  const SLIDE_DURATION = 2500;
  const slideContent = [
    { title: '도시의 속도를, 새롭게 정의하다.', desc: '전동킥보드로 잇는 가장 빠른 라스트마일, KINETIQ' },
    { title: '탈 때마다, 더 가벼운 이동', desc: '가벼운 배터리와 접이식 디자인의 KINETIQ 전동킥보드' },
    { title: '도시 전역, 언제나 가까운 스테이션', desc: '42개 도시 곳곳의 KINETIQ 킥보드 스테이션' },
  ];
  const slideEls = document.querySelectorAll('.hero__slide');
  const barEl = document.querySelector('.hero__pagination-bar');
  const toggleEl = document.querySelector('.hero__pagination-toggle');
  const titleEl = document.querySelector('.hero__title');
  const descEl = document.querySelector('.hero__desc');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (slideEls.length && barEl && titleEl && descEl) {
    let index = 0;
    let timer = null;

    const restartBar = () => {
      barEl.classList.remove('is-active');
      void barEl.offsetWidth; // force reflow so the fill animation restarts
      barEl.classList.add('is-active');
    };
    const render = () => {
      slideEls.forEach((el, i) => el.classList.toggle('is-active', i === index));
      titleEl.textContent = slideContent[index].title;
      descEl.textContent = slideContent[index].desc;
      restartBar();
    };
    const startTimer = () => {
      timer = setInterval(() => {
        index = (index + 1) % slideContent.length;
        render();
      }, SLIDE_DURATION);
    };

    render();
    if (!reduceMotion) startTimer();

    if (toggleEl) {
      toggleEl.addEventListener('click', () => {
        const willPause = !toggleEl.classList.contains('is-paused');
        toggleEl.classList.toggle('is-paused', willPause);
        toggleEl.setAttribute('aria-pressed', String(willPause));
        toggleEl.setAttribute('aria-label', willPause ? '슬라이드 재생' : '슬라이드 정지');
        barEl.classList.toggle('is-paused', willPause);
        if (willPause) {
          clearInterval(timer);
        } else {
          startTimer();
        }
      });
    }
  }

  // Reveal — 이미지 있는 줄과 그냥 줄이 번갈아 총 5줄, 스크롤한 만큼 모든 줄이
  // 동시에 좌→우로 채워짐(글은 색이, 줄 중간 이미지는 알약 너비가 같은 진행률로 함께 채워짐)
  const reveal = document.querySelector('.reveal');
  const lineEls = document.querySelectorAll('.rv-line');
  if (reveal && lineEls.length) {
    let plainLines = [];
    let imageLines = [];

    // 각 파트(앞글자/이미지/뒷글자)의 실제 글자 상자를 줄의 왼쪽 기준으로 재서,
    // 하나의 연속된 좌→우 와이프 좌표(wipeX)가 순서대로 지나가도록 함
    const partFrac = (wipeX, left, width) => (width > 0 ? Math.min(1, Math.max(0, (wipeX - left) / width)) : 0);

    const measure = () => {
      plainLines = Array.from(lineEls).filter((el) => !el.classList.contains('rv-line--image'));
      imageLines = Array.from(document.querySelectorAll('.rv-line--image')).map((el) => {
        const beforeFill = el.querySelector('.rv-line__before .rv-fill');
        const afterFill = el.querySelector('.rv-line__after .rv-fill');
        const grow = el.querySelector('.rv-chip__grow');
        const lineRect = el.getBoundingClientRect();
        const rectOf = (node) => node.getBoundingClientRect();
        const beforeRect = rectOf(beforeFill);
        const chipRect = rectOf(grow.parentElement);
        const afterRect = rectOf(afterFill);
        return {
          lineWidth: lineRect.width,
          before: { el: beforeFill, left: beforeRect.left - lineRect.left, width: beforeRect.width },
          chip: { el: grow, left: chipRect.left - lineRect.left, width: chipRect.width },
          after: { el: afterFill, left: afterRect.left - lineRect.left, width: afterRect.width },
        };
      });
    };

    // 모바일에서는 스크롤 중 주소창이 접히고 펴지면서 window.innerHeight(=100vh)가
    // 실시간으로 바뀌는데, .reveal 높이(CSS의 vh)와 여기서 쓰는 scrollable 계산이
    // 그 순간의 innerHeight를 각각 따로 참조하면 서로 어긋나서 애니메이션이 스크롤이
    // 끝나기 전에 이미 다 채워지거나(혹은 다 채워지기 전에 핀이 풀림) 하는 문제가
    // 생김. 그래서 뷰포트 높이를 한 번 캐싱해 컨테이너 실제 높이(px)로 못박아두고,
    // scrollable 계산도 항상 같은 값을 쓰게 해서 절대 어긋나지 않게 함.
    let cachedVH = window.innerHeight;
    let cachedWidth = window.innerWidth;
    const revealMultiplier = () => (window.matchMedia('(max-width:768px)').matches ? 3.2 : 2.8);
    const applyRevealHeight = () => { reveal.style.height = `${cachedVH * revealMultiplier()}px`; };
    applyRevealHeight();

    let ticking = false;
    const updateReveal = () => {
      const rect = reveal.getBoundingClientRect();
      const scrollable = rect.height - cachedVH;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

      plainLines.forEach((el) => {
        el.style.backgroundPositionX = `${(1 - progress) * 100}%`;
      });
      imageLines.forEach(({ lineWidth, before, chip, after }) => {
        const wipeX = progress * lineWidth;
        before.el.style.backgroundPositionX = `${(1 - partFrac(wipeX, before.left, before.width)) * 100}%`;
        chip.el.style.width = `${partFrac(wipeX, chip.left, chip.width) * 100}%`;
        after.el.style.backgroundPositionX = `${(1 - partFrac(wipeX, after.left, after.width)) * 100}%`;
      });
      ticking = false;
    };

    // 줄마다 다른 글자수 때문에 폰트 크기가 제각각으로 보이지 않도록, 가장 긴 줄이
    // 폭에 맞춰지는 데 필요한 배율 하나만 구해서 모든 줄에 동일하게 적용한다
    // (가장 긴 줄만 폭을 거의 채우고, 짧은 줄들은 같은 크기로 더 좁게 표시됨)
    const fitRevealLines = () => {
      const linesWrap = document.querySelector('.reveal .rv-lines');
      if (!linesWrap) return;
      const cs = getComputedStyle(linesWrap);
      const availWidth = linesWrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      lineEls.forEach((el) => { el.style.fontSize = ''; });
      let minScale = 1;
      let base = 0;
      lineEls.forEach((el) => {
        // 줄바꿈된 상태에서는 scrollWidth가 실제 한 줄 너비를 반영하지 못하므로
        // 측정 중엔 강제로 nowrap을 걸어 진짜 한 줄 너비를 잰다
        const prevWhiteSpace = el.style.whiteSpace;
        el.style.whiteSpace = 'nowrap';
        const naturalWidth = el.scrollWidth;
        el.style.whiteSpace = prevWhiteSpace;
        base = parseFloat(getComputedStyle(el).fontSize);
        if (naturalWidth > 0 && availWidth > 0) {
          const scale = (availWidth * 0.98) / naturalWidth;
          if (scale < minScale) minScale = scale;
        }
      });
      lineEls.forEach((el) => { el.style.fontSize = `${base * minScale}px`; });
    };

    fitRevealLines();
    measure();
    updateReveal();
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateReveal);
          ticking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener('resize', () => {
      // 주소창 접힘/펼침으로 인한 세로 폭 변화는 무시하고, 실제 회전/리사이즈(가로 폭
      // 변화)일 때만 캐시된 뷰포트 높이를 다시 잡아 애니메이션 길이를 재계산한다
      if (window.innerWidth !== cachedWidth) {
        cachedWidth = window.innerWidth;
        cachedVH = window.innerHeight;
        applyRevealHeight();
      }
      fitRevealLines();
      measure();
      updateReveal();
    });
  }

  const nav = document.querySelector('.nav');
  if (nav) {
    let ticking = false;
    const setScrolled = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
      ticking = false;
    };
    setScrolled();
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(setScrolled);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // Moments — MOMENTS 섹션에 도착하면 화면이 고정되고, 스크롤한 만큼
  // 5도씩 차이나는 각도가 점점 풀리며 원래 그리드 위치로 펼쳐진 뒤 고정이 풀림
  const moments = document.querySelector('.moments');
  const momentsGrid = document.querySelector('.moments__grid');
  if (moments && momentsGrid) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      momentsGrid.style.setProperty('--p', 1);
    } else {
      let ticking = false;
      const UNFOLD_PORTION = 0.55; // 고정 구간의 앞 55%에서 펼침을 끝내고, 남은 45%는 펼쳐진 채로 멈춰있다가 스크롤이 풀림
      const updateMoments = () => {
        const rect = moments.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const raw = scrollable > 0 ? -rect.top / (scrollable * UNFOLD_PORTION) : 0;
        const progress = Math.min(1, Math.max(0, raw));
        momentsGrid.style.setProperty('--p', progress);
        ticking = false;
      };
      updateMoments();
      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            requestAnimationFrame(updateMoments);
            ticking = true;
          }
        },
        { passive: true }
      );
      window.addEventListener('resize', updateMoments);
    }
  }
})();
