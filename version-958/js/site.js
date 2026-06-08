(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var isOpen = mobileNav.classList.toggle("is-open");
                menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var prev = hero.querySelector(".hero-prev");
            var next = hero.querySelector(".hero-next");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    restart();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }
            show(0);
            restart();
        }

        var forms = Array.prototype.slice.call(document.querySelectorAll(".movie-search-form"));
        forms.forEach(function (form) {
            var list = form.parentElement ? form.parentElement.querySelector(".searchable-list") : null;
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-title]"));
            var params = new URLSearchParams(window.location.search);
            Array.prototype.slice.call(form.elements).forEach(function (field) {
                if (field.name && params.has(field.name)) {
                    field.value = params.get(field.name) || "";
                }
            });

            function value(name) {
                return (form.elements[name] && form.elements[name].value || "").trim().toLowerCase();
            }

            function apply() {
                var query = value("q");
                var type = value("type");
                var year = parseInt(value("year"), 10);
                var category = value("category");
                cards.forEach(function (card) {
                    var haystack = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.category,
                        card.dataset.tags
                    ].join(" ").toLowerCase();
                    var cardType = (card.dataset.type || "").toLowerCase();
                    var cardYear = parseInt(card.dataset.year || "0", 10);
                    var cardCategory = (card.dataset.category || "").toLowerCase();
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchType = !type || cardType.indexOf(type) !== -1;
                    var matchYear = !year || cardYear >= year;
                    var matchCategory = !category || cardCategory === category;
                    card.classList.toggle("is-filtered-out", !(matchQuery && matchType && matchYear && matchCategory));
                });
            }

            form.addEventListener("input", apply);
            form.addEventListener("change", apply);
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
            apply();
        });
    });

    window.initializeMoviePlayer = function (source) {
        ready(function () {
            var video = document.getElementById("moviePlayer");
            var button = document.getElementById("moviePlayerStart");
            if (!video || !source) {
                return;
            }
            var hls = null;

            function load() {
                if (video.dataset.ready === "1") {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else {
                    video.src = source;
                }
                video.dataset.ready = "1";
            }

            function play() {
                load();
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
                if (button) {
                    button.classList.add("is-hidden");
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            video.addEventListener("click", load);
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    };
})();
