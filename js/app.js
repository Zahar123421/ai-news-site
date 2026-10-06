// ИИ Дайджест — рендер и фильтры
(function () {
  var data = window.NEWS_DATA || { items: [] };
  var items = data.items.slice();

  var PAGE_SIZE = 9;
  var state = { category: "all", query: "", shown: PAGE_SIZE };

  var grid = document.getElementById("news-grid");
  var hero = document.getElementById("hero");
  var empty = document.getElementById("empty");
  var loadMore = document.getElementById("load-more");

  var CAT_CLASS = {
    "Модели": "cat-models",
    "Бизнес": "cat-business",
    "Индустрия": "cat-industry",
    "Наука": "cat-science",
    "Общество": "cat-society"
  };

  function formatDate(iso) {
    var parts = iso.split("-");
    var months = ["января", "февраля", "марта", "апреля", "мая", "июня",
                  "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    return Number(parts[2]) + " " + months[Number(parts[1]) - 1] + " " + parts[0];
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function filtered() {
    var q = state.query.toLowerCase();
    return items.filter(function (it) {
      if (state.category !== "all" && it.category !== state.category) return false;
      if (q && (it.title + " " + it.summary).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function renderHero() {
    var feat = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].featured) { feat = items[i]; break; }
    }
    if (!feat || state.category !== "all" || state.query) {
      hero.hidden = true;
      return;
    }
    hero.hidden = false;
    var himg = document.getElementById("hero-img");
    himg.src = "img/cover-" + feat.id + ".svg";
    himg.alt = feat.title;
    himg.hidden = false;
    himg.onerror = function () { himg.hidden = true; };
    document.getElementById("hero-date").textContent = formatDate(feat.date);
    document.getElementById("hero-title").textContent = feat.title;
    document.getElementById("hero-summary").textContent = feat.summary;
    var link = document.getElementById("hero-link");
    link.href = "article.html?id=" + encodeURIComponent(feat.id);
  }

  function render() {
    renderHero();
    var list = filtered().filter(function (it) { return !it.featured || state.category !== "all" || state.query; });
    // главная новость показывается и в ленте при фильтрации — но не дублируется в «Все»
    var visible = list.slice(0, state.shown);

    grid.innerHTML = "";
    visible.forEach(function (it) {
      var card = document.createElement("article");
      card.className = "news-card";
      var catClass = CAT_CLASS[it.category] || "";
      card.innerHTML =
        '<a class="cover-link" href="article.html?id=' + encodeURIComponent(it.id) + '">' +
          '<img class="cover" loading="lazy" src="img/cover-' + encodeURIComponent(it.id) + '.svg" alt="" ' +
          'onerror="this.style.display=\'none\'">' +
        "</a>" +
        '<div class="meta">' +
          '<span class="badge ' + catClass + '">' + esc(it.category) + "</span>" +
          '<span class="date">' + formatDate(it.date) + "</span>" +
        "</div>" +
        '<h2><a href="article.html?id=' + encodeURIComponent(it.id) + '">' + esc(it.title) + "</a></h2>" +
        "<p>" + esc(it.summary) + "</p>" +
        '<div class="card-foot">' +
          '<a class="source-link" href="article.html?id=' + encodeURIComponent(it.id) + '">Подробнее →</a>' +
          '<span class="source-name">Источник: ' + esc(it.source) + "</span>" +
        "</div>";
      grid.appendChild(card);
    });

    empty.hidden = list.length > 0;
    loadMore.hidden = list.length <= state.shown;

    var cnt = document.getElementById("feed-count");
    if (cnt) {
      var n = filtered().length;
      var last = n === 1 ? "новость" : (n >= 2 && n <= 4 ? "новости" : "новостей");
      cnt.textContent = n + " " + last;
    }
  }

  document.querySelectorAll(".nav-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".nav-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      state.category = btn.dataset.category;
      state.shown = PAGE_SIZE;
      render();
    });
  });

  document.getElementById("search").addEventListener("input", function (e) {
    state.query = e.target.value.trim();
    state.shown = PAGE_SIZE;
    render();
  });

  loadMore.addEventListener("click", function () {
    state.shown += PAGE_SIZE;
    render();
  });

  var upd = document.getElementById("last-updated");
  if (upd) upd.textContent = formatDate(data.lastUpdated);

  render();
})();
