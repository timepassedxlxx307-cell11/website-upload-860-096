(function () {
    var mobileButton = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        show(0);
        start();
    });

    document.querySelectorAll('[data-search-input]').forEach(function (input) {
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            document.querySelectorAll('.filter-card').forEach(function (card) {
                var value = (card.getAttribute('data-filter-text') || card.textContent || '').toLowerCase();
                card.classList.toggle('is-hidden', query !== '' && value.indexOf(query) === -1);
            });
        });
    });

    document.querySelectorAll('[data-video-src]').forEach(function (box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('.player-cover');
        var src = box.getAttribute('data-video-src');
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded || !video || !src) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function play() {
            load();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video) {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    });
})();
