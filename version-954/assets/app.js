(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(next) {
      slides[index].classList.remove("is-active");
      dots[index].classList.remove("is-active");
      index = next;
      slides[index].classList.add("is-active");
      dots[index].classList.add("is-active");
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupLocalFilter() {
    var input = document.querySelector(".local-filter") || document.querySelector(".search-page-input");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-tip");
    if (!input || cards.length === 0) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (q) {
      input.value = q;
    }
    function apply() {
      var keyword = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matched = keyword === "" || haystack.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    input.addEventListener("input", apply);
    apply();
  }

  ready(function () {
    setupMenu();
    setupCarousel();
    setupLocalFilter();
  });
})();
