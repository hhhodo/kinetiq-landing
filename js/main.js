// KINETIQ landing — nav scroll state, hero 자동 슬라이드 전환 (마퀴는 CSS 애니메이션으로만 동작)
(function () {
  const SLIDE_DURATION = 5000;
  const slideContent = [
    { title: '도시의 속도를, 새롭게 정의하다.', desc: '전기 마이크로모빌리티로 라스트마일을 잇는 스마트 모빌리티 플랫폼' },
    { title: '탈 때마다, 더 가벼운 이동', desc: '가벼운 배터리와 손쉬운 대여로 완성하는 도심형 전기 스쿠터' },
    { title: '도시 전역, 언제나 가까운 스테이션', desc: '42개 도시에 촘촘히 놓인 KINETIQ 스테이션으로 이어지는 이동' },
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

    const measure = () => {
      plainLines = Array.from(lineEls).filter((el) => !el.classList.contains('rv-line--image'));
      imageLines = Array.from(document.querySelectorAll('.rv-line--image')).map((el) => {
        const img = el.querySelector('.rv-chip__img');
        const before = el.querySelector('.rv-line__before');
        const after = el.querySelector('.rv-line__after');
        const lineRect = el.getBoundingClientRect();
        const chipRect = img.parentElement.getBoundingClientRect();
        return {
          before,
          after,
          img,
          chipLeft: chipRect.left - lineRect.left,
          chipWidth: chipRect.width,
          lineWidth: lineRect.width,
        };
      });
    };

    let ticking = false;
    const updateReveal = () => {
      const rect = reveal.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

      plainLines.forEach((el) => {
        el.style.backgroundPositionX = `${(1 - progress) * 100}%`;
      });
      imageLines.forEach(({ before, after, img, chipLeft, chipWidth, lineWidth }) => {
        const pos = `${(1 - progress) * 100}%`;
        before.style.backgroundPositionX = pos;
        after.style.backgroundPositionX = pos;
        const wipeX = progress * lineWidth;
        const chipFrac = chipWidth > 0 ? Math.min(1, Math.max(0, (wipeX - chipLeft) / chipWidth)) : 0;
        img.style.width = `${chipFrac * 100}%`;
      });
      ticking = false;
    };

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
})();
