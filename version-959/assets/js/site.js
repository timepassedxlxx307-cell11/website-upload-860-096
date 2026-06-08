(function () {
    var mobileToggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            document.body.classList.toggle('menu-open', open);
            mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var carousel = document.querySelector('[data-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var next = carousel.querySelector('.hero-next');
        var prev = carousel.querySelector('.hero-prev');
        var current = 0;
        var timer;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide') || 0));
                startTimer();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        var input = document.querySelector('.site-search-input');
        var list = document.querySelector('.searchable-list');
        var activeChip = document.querySelector('.filter-chip.active');

        if (!list) {
            return;
        }

        var query = normalize(input ? input.value : '');
        var chip = activeChip ? normalize(activeChip.getAttribute('data-filter')) : 'all';
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .rank-row'));

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-keywords'),
                card.textContent
            ].join(' '));
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchChip = !chip || chip === 'all' || haystack.indexOf(chip) !== -1;
            card.classList.toggle('is-hidden', !(matchQuery && matchChip));
        });
    }

    var mainSearch = document.querySelector('.site-search-input');

    if (mainSearch) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q) {
            mainSearch.value = q;
        }

        mainSearch.addEventListener('input', applyFilters);
        applyFilters();
    }

    Array.prototype.slice.call(document.querySelectorAll('.filter-chip')).forEach(function (button) {
        button.addEventListener('click', function () {
            Array.prototype.slice.call(button.parentElement.querySelectorAll('.filter-chip')).forEach(function (item) {
                item.classList.remove('active');
            });
            button.classList.add('active');
            applyFilters();
        });
    });

    Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(function (box) {
        var video = box.querySelector('.video-player');
        var button = box.querySelector('.play-button');
        var status = box.querySelector('.player-status');
        var hlsInstance = null;

        if (!video) {
            return;
        }

        function setStatus(text) {
            if (status) {
                status.textContent = text || '';
            }
        }

        function startPlayer() {
            var source = video.getAttribute('data-video-url');

            if (!source) {
                setStatus('暂时无法播放');
                return;
            }

            if (button) {
                button.classList.add('is-hidden');
            }

            setStatus('正在缓冲');

            if (video.getAttribute('data-ready') === 'true') {
                video.play().catch(function () {
                    setStatus('点击视频继续播放');
                });
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.setAttribute('data-ready', 'true');
                video.play().then(function () {
                    setStatus('');
                }).catch(function () {
                    setStatus('点击视频继续播放');
                });
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.setAttribute('data-ready', 'true');
                    video.play().then(function () {
                        setStatus('');
                    }).catch(function () {
                        setStatus('点击视频继续播放');
                    });
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放中断，请刷新重试');
                        if (hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                        }
                    }
                });
                return;
            }

            setStatus('当前设备暂不支持播放');
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                startPlayer();
            });
        }

        box.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            if (event.target.closest && event.target.closest('.play-button')) {
                return;
            }
            startPlayer();
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
            setStatus('');
        });
    });
})();
