(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var nav = qs(".site-nav");
    var toggle = qs(".mobile-toggle");
    var panel = qs(".mobile-panel");

    if (nav && !nav.classList.contains("nav-solid")) {
      var onScroll = function () {
        if (window.scrollY > 20) {
          nav.classList.add("is-scrolled");
        } else {
          nav.classList.remove("is-scrolled");
        }
      };

      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var isOpen = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }
  }

  function setupHero() {
    var hero = qs("[data-carousel]");
    if (!hero) {
      return;
    }

    var slides = qsa(".hero-slide", hero);
    var dots = qsa("[data-go]", hero);
    var prev = qs("[data-prev]", hero);
    var next = qs("[data-next]", hero);
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-go")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupRails() {
    qsa("[data-rail]").forEach(function (rail) {
      var name = rail.getAttribute("data-rail");
      var prev = qs("[data-rail-prev='" + name + "']");
      var next = qs("[data-rail-next='" + name + "']");
      var amount = 430;

      if (prev) {
        prev.addEventListener("click", function () {
          rail.scrollBy({ left: -amount, behavior: "smooth" });
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          rail.scrollBy({ left: amount, behavior: "smooth" });
        });
      }
    });
  }

  function setupSearch() {
    var input = qs("[data-search-input]");
    var cards = qsa(".js-search-card");
    var filters = qsa("[data-filter]");
    var activeFilter = "all";

    if (!input && filters.length === 0) {
      return;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function filterCards() {
      var keyword = normalize(input ? input.value : "");

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-category"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" "));

        var category = card.getAttribute("data-category") || "";
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesFilter = activeFilter === "all" || category === activeFilter;
        card.classList.toggle("is-hidden-card", !(matchesKeyword && matchesFilter));
      });
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }

    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        filters.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        activeFilter = button.getAttribute("data-filter") || "all";
        filterCards();
      });
    });
  }

  window.initMoviePlayer = function (videoId, playId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var play = document.getElementById(playId);
    var overlay = document.getElementById(overlayId);
    var hasStarted = false;
    var hls;

    if (!video || !overlay) {
      return;
    }

    function hideOverlay() {
      overlay.classList.add("is-hidden");
    }

    function showOverlay() {
      overlay.classList.remove("is-hidden");
    }

    function attachSource() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = sourceUrl;
    }

    function begin() {
      if (!hasStarted) {
        hasStarted = true;
        attachSource();
      }

      video.controls = true;
      hideOverlay();
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          showOverlay();
        });
      }
    }

    overlay.addEventListener("click", begin);

    if (play) {
      play.addEventListener("click", function (event) {
        event.stopPropagation();
        begin();
      });
    }

    video.addEventListener("click", function () {
      if (!hasStarted) {
        begin();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupHero();
    setupRails();
    setupSearch();
  });
}());
