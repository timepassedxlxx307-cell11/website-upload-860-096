(function () {
    function toggleMobileNav() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(active - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(active + 1);
        }, 5200);
    }

    function setupScrollButtons() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-left], [data-scroll-right]"));
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var targetId = button.getAttribute("data-scroll-left") || button.getAttribute("data-scroll-right");
                var target = document.getElementById(targetId);
                var direction = button.hasAttribute("data-scroll-left") ? -1 : 1;
                if (target) {
                    target.scrollBy({
                        left: direction * 420,
                        behavior: "smooth"
                    });
                }
            });
        });
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
        panels.forEach(function (panel) {
            var queryInput = panel.querySelector("[data-filter-query]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var scope = panel.nextElementSibling || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));

            function text(value) {
                return String(value || "").toLowerCase();
            }

            function apply() {
                var query = text(queryInput && queryInput.value).trim();
                var typeValue = typeSelect ? typeSelect.value : "";
                var yearValue = yearSelect ? yearSelect.value : "";

                cards.forEach(function (card) {
                    var combined = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year")
                    ].join(" ").toLowerCase();
                    var matchesQuery = !query || combined.indexOf(query) !== -1;
                    var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
                    var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
                    card.classList.toggle("is-hidden", !(matchesQuery && matchesType && matchesYear));
                });
            }

            [queryInput, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q");
            if (initial && queryInput) {
                queryInput.value = initial;
                apply();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        toggleMobileNav();
        setupHero();
        setupScrollButtons();
        setupFilters();
    });
}());
