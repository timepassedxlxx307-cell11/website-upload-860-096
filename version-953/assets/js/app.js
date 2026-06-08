(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        restart();
      });
    });

    show(0);
    restart();
  });

  document.querySelectorAll('[data-card-grid]').forEach(function (grid) {
    var scope = grid.closest('.section') || document;
    var input = scope.querySelector('.js-search-input');
    var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-chip]'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var emptyState = scope.querySelector('[data-empty-state]');
    var activeFilter = 'all';

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var searchText = card.getAttribute('data-search') || '';
        var filterText = card.getAttribute('data-filter') || '';
        var matchQuery = !query || searchText.indexOf(query) !== -1;
        var matchFilter = activeFilter === 'all' || filterText.indexOf(activeFilter.toLowerCase()) !== -1;
        var isVisible = matchQuery && matchFilter;
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter-chip') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyFilter();
      });
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var button = player.querySelector('[data-player-button]');
    var message = player.querySelector('[data-player-message]');
    var source = player.getAttribute('data-source');
    var hls = null;
    var loaded = false;

    function setMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text || '';
      message.classList.toggle('is-visible', Boolean(text));
    }

    function attachSource() {
      if (!video || !source || loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage('网络连接异常，正在重新加载');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage('媒体加载异常，正在尝试恢复');
            hls.recoverMediaError();
          } else {
            setMessage('当前浏览器暂时无法播放该视频');
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }
      attachSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
          setMessage('点击播放按钮开始观看');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        playVideo();
      });
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      setMessage('');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        return;
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
