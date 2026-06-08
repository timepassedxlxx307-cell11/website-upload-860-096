function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(() => {
  initMobileMenu();
  initHeroSlider();
  initCardFilters();
  initSearchPage();
  initPlayers();
});

function initMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-menu]");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function initHeroSlider() {
  const slider = document.querySelector("[data-hero-slider]");

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  const prev = slider.querySelector("[data-hero-prev]");
  const next = slider.querySelector("[data-hero-next]");
  let activeIndex = 0;
  let timer = null;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5500);
  }

  function stopAutoPlay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      showSlide(dotIndex);
      startAutoPlay();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      showSlide(activeIndex - 1);
      startAutoPlay();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      showSlide(activeIndex + 1);
      startAutoPlay();
    });
  }

  slider.addEventListener("mouseenter", stopAutoPlay);
  slider.addEventListener("mouseleave", startAutoPlay);
  showSlide(0);
  startAutoPlay();
}

function initCardFilters() {
  const panels = Array.from(document.querySelectorAll("[data-card-filter]"));

  panels.forEach((panel) => {
    const keywordInput = panel.querySelector("[data-filter-keyword]");
    const yearSelect = panel.querySelector("[data-filter-year]");
    const regionSelect = panel.querySelector("[data-filter-region]");
    const grid = document.querySelector("[data-filter-grid]");
    const empty = document.querySelector("[data-filter-empty]");

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll(".movie-card"));

    function applyFilter() {
      const keyword = normalize(keywordInput ? keywordInput.value : "");
      const year = yearSelect ? yearSelect.value : "";
      const region = regionSelect ? regionSelect.value : "";
      let visibleCount = 0;

      cards.forEach((card) => {
        const haystack = normalize(`${card.dataset.title || ""} ${card.dataset.tags || ""}`);
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesYear = !year || (card.dataset.year || "") === year;
        const matchesRegion = !region || (card.dataset.region || "") === region;
        const visible = matchesKeyword && matchesYear && matchesRegion;

        card.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    [keywordInput, yearSelect, regionSelect].forEach((control) => {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });
}

function initSearchPage() {
  const results = document.querySelector("[data-search-results]");

  if (!results || !Array.isArray(window.MOVIE_DATA)) {
    return;
  }

  const url = new URL(window.location.href);
  const input = document.querySelector("[data-search-input]");
  const categorySelect = document.querySelector("[data-search-category]");
  const typeSelect = document.querySelector("[data-search-type]");
  const title = document.querySelector("[data-search-title]");
  const summary = document.querySelector("[data-search-summary]");
  const empty = document.querySelector("[data-search-empty]");
  const root = document.body.dataset.root || "";

  if (input) {
    input.value = url.searchParams.get("q") || "";
  }

  function render() {
    const query = normalize(input ? input.value : "");
    const category = categorySelect ? categorySelect.value : "";
    const type = typeSelect ? typeSelect.value : "";

    const matches = window.MOVIE_DATA.filter((movie) => {
      const haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genreRaw,
        movie.oneLine,
        movie.summary,
        ...(movie.tags || [])
      ].join(" "));
      const matchesQuery = !query || haystack.includes(query);
      const matchesCategory = !category || movie.primaryCategory === category;
      const matchesType = !type || movie.type === type;

      return matchesQuery && matchesCategory && matchesType;
    }).slice(0, 240);

    if (title) {
      title.textContent = query ? `“${input.value}” 的搜索结果` : "推荐影片";
    }

    if (summary) {
      summary.textContent = matches.length ? "点击任意卡片进入详情页播放。" : "没有找到匹配内容，可以尝试更短的关键词。";
    }

    results.innerHTML = matches.map((movie) => renderMovieCard(movie, root)).join("");

    if (empty) {
      empty.hidden = matches.length !== 0;
    }
  }

  [input, categorySelect, typeSelect].forEach((control) => {
    if (control) {
      control.addEventListener("input", render);
      control.addEventListener("change", render);
    }
  });

  render();
}

function renderMovieCard(movie, root) {
  const safeTitle = escapeHtml(movie.title);
  const detailHref = `${root}${movie.detailPath}`;
  const coverSrc = `${root}${movie.cover}`;
  const meta = [movie.year, movie.type, movie.genreRaw].filter(Boolean).join(" · ");

  return `
<article class="movie-card" data-title="${safeTitle}" data-region="${escapeHtml(movie.region)}" data-year="${escapeHtml(movie.year)}" data-tags="${escapeHtml((movie.tags || []).join(" "))}">
  <a class="movie-poster" href="${detailHref}" aria-label="播放 ${safeTitle}">
    <img src="${coverSrc}" alt="${safeTitle}" loading="lazy">
    <span class="poster-gradient"></span>
    <span class="play-bubble">▶</span>
    <span class="region-badge">${escapeHtml(movie.region || movie.type)}</span>
  </a>
  <div class="movie-info">
    <div class="movie-title-row">
      <h3><a href="${detailHref}">${safeTitle}</a></h3>
    </div>
    <p class="movie-meta">${escapeHtml(meta)}</p>
    <p class="movie-line">${escapeHtml(movie.oneLine || "")}</p>
  </div>
</article>`;
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll("[data-player]"));

  players.forEach((video) => {
    const source = video.dataset.videoSrc;
    const frame = video.closest(".player-frame");
    const startButton = frame ? frame.querySelector("[data-player-start]") : null;
    const status = frame ? frame.querySelector("[data-player-status]") : null;
    let hlsInstance = null;
    let initialized = false;

    async function initializePlayer() {
      if (initialized || !source) {
        return;
      }

      initialized = true;
      setStatus(status, "正在载入播放源...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus(status, "播放源已绑定");
        return;
      }

      try {
        const module = await import("./hls.js");
        const Hls = module.H;

        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => setStatus(status, "播放源已就绪"));
          hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
            if (data && data.fatal) {
              setStatus(status, "播放加载失败，请刷新重试");
            }
          });
        } else {
          setStatus(status, "当前浏览器不支持 HLS 播放");
        }
      } catch (error) {
        setStatus(status, "播放器初始化失败");
        console.error(error);
      }
    }

    async function playVideo() {
      await initializePlayer();

      try {
        await video.play();
      } catch (error) {
        setStatus(status, "浏览器阻止了自动播放，请再次点击播放");
      }
    }

    if (startButton) {
      startButton.addEventListener("click", playVideo);
    }

    video.addEventListener("click", () => {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", () => {
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
      setStatus(status, "正在播放");
    });

    video.addEventListener("pause", () => {
      if (startButton) {
        startButton.classList.remove("is-hidden");
      }
      setStatus(status, "已暂停，点击继续播放");
    });

    video.addEventListener("error", () => setStatus(status, "视频播放出错，请稍后重试"));
    initializePlayer();

    window.addEventListener("beforeunload", () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

function setStatus(element, message) {
  if (element) {
    element.textContent = message;
  }
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
