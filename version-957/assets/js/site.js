(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var url = './search.html';
      if (query) {
        url += '?q=' + encodeURIComponent(query);
      }
      window.location.href = url;
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var active = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = parseInt(dot.getAttribute('data-hero-dot') || '0', 10);
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5000);
  }

  var input = document.querySelector('[data-filter-input]');
  var select = document.querySelector('[data-category-select]');
  var list = document.querySelector('[data-filter-list]');
  var empty = document.querySelector('[data-empty-state]');
  var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-card]')) : [];
  function currentQuery() {
    return input ? input.value.trim().toLowerCase() : '';
  }
  function currentCategory() {
    return select ? select.value : '';
  }
  function applyFilter() {
    var query = currentQuery();
    var category = currentCategory();
    var visible = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardCategory = card.getAttribute('data-category') || '';
      var matchedText = !query || text.indexOf(query) !== -1;
      var matchedCategory = !category || cardCategory === category;
      var show = matchedText && matchedCategory;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }
  if (input) {
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';
    if (queryFromUrl) {
      input.value = queryFromUrl;
    }
    input.addEventListener('input', applyFilter);
  }
  if (select) {
    select.addEventListener('change', applyFilter);
  }
  if (cards.length) {
    applyFilter();
  }
})();
