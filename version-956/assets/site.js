const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
};

const normalize = (value) => String(value || '').trim().toLowerCase();

const initMobileMenu = () => {
  const button = document.querySelector('[data-mobile-menu]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!button || !nav) return;

  button.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    button.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      button.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });
};

const initHero = () => {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  if (slides.length <= 1) return;

  let current = 0;
  let timer = 0;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
  };

  const play = () => {
    clearInterval(timer);
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      play();
    });
  });

  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', play);
  play();
};

const fillFilterOptions = (panel) => {
  const scope = panel.closest('section') || document;
  const cards = Array.from(scope.querySelectorAll('[data-title]'));
  const selects = Array.from(panel.querySelectorAll('[data-filter-select]'));

  selects.forEach((select) => {
    const field = select.getAttribute('data-filter-select');
    const values = Array.from(new Set(cards.map((card) => card.dataset[field]).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-CN'));
    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  });
};

const applyFilters = (panel) => {
  const scope = panel.closest('section') || document;
  const cards = Array.from(scope.querySelectorAll('[data-title]'));
  const input = panel.querySelector('[data-filter-input]');
  const selects = Array.from(panel.querySelectorAll('[data-filter-select]'));
  const keyword = normalize(input ? input.value : '');

  cards.forEach((card) => {
    const haystack = normalize([
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.dataset.genre,
      card.textContent
    ].join(' '));

    const keywordMatch = !keyword || haystack.includes(keyword);
    const selectMatch = selects.every((select) => {
      const field = select.getAttribute('data-filter-select');
      return !select.value || card.dataset[field] === select.value;
    });

    card.classList.toggle('is-filter-hidden', !(keywordMatch && selectMatch));
  });
};

const initFilters = () => {
  const panels = Array.from(document.querySelectorAll('[data-card-filter]'));
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';

  panels.forEach((panel) => {
    fillFilterOptions(panel);
    const input = panel.querySelector('[data-filter-input]');
    const controls = Array.from(panel.querySelectorAll('input, select'));

    if (input && query) {
      input.value = query;
    }

    controls.forEach((control) => {
      control.addEventListener('input', () => applyFilters(panel));
      control.addEventListener('change', () => applyFilters(panel));
    });

    applyFilters(panel);
  });
};

const initMoviePage = async (source) => {
  const video = document.getElementById('moviePlayer');
  const button = document.getElementById('videoPlayButton');
  if (!video || !button || !source) return;

  let loaded = false;

  const bind = () => {
    if (loaded) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      loaded = true;
      return;
    }

    const Hls = window.Hls;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    loaded = true;
  };

  const start = async () => {
    bind();
    button.classList.add('is-hidden');
    try {
      await video.play();
    } catch (error) {
      button.classList.remove('is-hidden');
    }
  };

  button.addEventListener('click', start);
  video.addEventListener('click', () => {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', () => button.classList.add('is-hidden'));
  video.addEventListener('pause', () => {
    if (video.currentTime < 0.2 || video.ended) {
      button.classList.remove('is-hidden');
    }
  });
};

window.MovieSite = Object.assign(window.MovieSite || {}, {
  initMoviePage
});

ready(() => {
  initMobileMenu();
  initHero();
  initFilters();
});
