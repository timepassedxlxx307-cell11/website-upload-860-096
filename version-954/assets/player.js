(function () {
  function hide(element) {
    if (element) {
      element.classList.add("is-hidden");
    }
  }

  function setMessage(video, text) {
    video.setAttribute("aria-label", text);
  }

  window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
      return;
    }

    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
            return;
          }
          setMessage(video, "播放暂时不可用");
          hlsInstance.destroy();
        });
      } else {
        setMessage(video, "播放暂时不可用");
      }
    }

    function play() {
      attach();
      hide(button);
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      hide(button);
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
