(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movieVideo');
    var cover = document.getElementById('moviePlayCover');
    if (!video || !cover || !source) {
      return;
    }
    var started = false;
    var hls = null;
    function safePlay() {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }
    function attachSource() {
      if (started) {
        safePlay();
        return;
      }
      started = true;
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        safePlay();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          safePlay();
        });
        return;
      }
      video.src = source;
      safePlay();
    }
    function start() {
      cover.classList.add('is-hidden');
      attachSource();
    }
    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();
