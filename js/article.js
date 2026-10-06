// ИИ Дайджест — страница статьи (всё внутри нашего сайта)
(function () {
  var data = window.NEWS_DATA || { items: [] };
  var items = data.items;

  function formatDate(iso) {
    var p = iso.split("-");
    var m = ["января", "февраля", "марта", "апреля", "мая", "июня",
             "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    return Number(p[2]) + " " + m[Number(p[1]) - 1] + " " + p[0];
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  var CAT_CLASS = {
    "Модели": "cat-models",
    "Бизнес": "cat-business",
    "Индустрия": "cat-industry",
    "Наука": "cat-science",
    "Общество": "cat-society"
  };

  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var item = null;
  for (var i = 0; i < items.length; i++) {
    if (items[i].id === id) { item = items[i]; break; }
  }

  var upd = document.getElementById("last-updated");
  if (upd) upd.textContent = formatDate(data.lastUpdated);

  if (!item) {
    document.getElementById("article").hidden = true;
    document.getElementById("a-notfound").hidden = false;
    return;
  }

  // Заголовок страницы + OG
  document.title = item.title + " — ИИ Дайджест";
  var ogT = document.querySelector('meta[property="og:title"]');
  if (ogT) ogT.setAttribute("content", item.title);
  var ogD = document.createElement("meta");
  ogD.setAttribute("property", "og:description");
  ogD.setAttribute("content", item.summary.slice(0, 200));
  document.head.appendChild(ogD);

  var catEl = document.getElementById("a-cat");
  catEl.textContent = item.category;
  catEl.className = "badge " + (CAT_CLASS[item.category] || "");
  document.getElementById("a-date").textContent = formatDate(item.date);
  document.getElementById("a-title").textContent = item.title;

  // Обложка статьи (локальная, ничего чужого)
  var banner = document.getElementById("a-banner");
  banner.src = "img/cover-" + item.id + ".svg";
  banner.alt = item.title;
  banner.hidden = false;
  banner.onerror = function () { banner.hidden = true; };

  // Видео-демо (локальный файл — читатель остаётся на нашем сайте)
  if (item.media) {
    var figure = document.createElement("figure");
    figure.className = "article-media";
    var m = document.createElement("img");
    m.src = item.media;
    m.alt = item.title;
    m.loading = "lazy";
    m.onerror = function () { figure.remove(); };
    figure.appendChild(m);
    if (item.mediaCaption) {
      var cap = document.createElement("figcaption");
      cap.textContent = item.mediaCaption;
      figure.appendChild(cap);
    }
    var textNode = document.getElementById("a-text");
    textNode.parentNode.insertBefore(figure, textNode.nextSibling);
  }

  // Внешний плеер — встроенный iframe, читатель остаётся на нашем сайте
  if (item.video) {
    var vw = document.getElementById("a-video");
    var frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(item.video);
    frame.title = "Видео к новости";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
    frame.allowFullscreen = true;
    frame.setAttribute("loading", "lazy");
    vw.appendChild(frame);
    vw.hidden = false;
  }

  // Текст: если есть полный content — используем его, иначе summary по предложениям
  var textEl = document.getElementById("a-text");
  if (item.content && item.content.length) {
    item.content.forEach(function (par) {
      var p = document.createElement("p");
      p.textContent = par;
      textEl.appendChild(p);
    });
  } else {
    var sentences = item.summary.match(/[^.!?]+[.!?]+/g) || [item.summary];
    sentences.forEach(function (s) {
      var p = document.createElement("p");
      p.textContent = s.trim();
      textEl.appendChild(p);
    });
  }

  // Упоминание источника — только текстом, без перехода на чужой сайт
  document.getElementById("a-source").textContent =
    "Источник информации: " + item.source + ". Материал пересказан редакцией ИИ Дайджест.";

  // Читайте также — до 3 новостей той же категории (или просто другие)
  var related = items.filter(function (it) {
    return it.id !== item.id && it.category === item.category;
  });
  if (related.length < 3) {
    items.forEach(function (it) {
      if (it.id !== item.id && related.indexOf(it) === -1 && related.length < 3) related.push(it);
    });
  }
  related = related.slice(0, 3);

  if (related.length) {
    document.getElementById("related").hidden = false;
    var grid = document.getElementById("related-grid");
    related.forEach(function (it) {
      var card = document.createElement("article");
      card.className = "news-card";
      card.innerHTML =
        '<div class="meta">' +
          '<span class="badge ' + (CAT_CLASS[it.category] || "") + '">' + esc(it.category) + "</span>" +
          '<span class="date">' + formatDate(it.date) + "</span>" +
        "</div>" +
        '<h2><a href="article.html?id=' + encodeURIComponent(it.id) + '">' + esc(it.title) + "</a></h2>" +
        "<p>" + esc(it.summary) + "</p>";
      grid.appendChild(card);
    });
  }
})();
