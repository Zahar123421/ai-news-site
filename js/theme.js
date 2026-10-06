// НейроЛента — переключатель тем (базовая: светлая; режимы: светлая → тёмная → авто)
(function () {
  var ORDER = { light: "dark", dark: "auto", auto: "light" };
  var LABEL = { light: "светлая", dark: "тёмная", auto: "авто (по системе)" };
  var ICON = { light: "☀️", dark: "🌙", auto: "💻" };

  function pref() {
    try { return localStorage.getItem("nl-theme") || "light"; } catch (e) { return "light"; }
  }

  function apply() {
    var p = pref();
    var t = p;
    if (p === "auto") {
      t = (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", t);
    var icon = document.getElementById("theme-icon");
    if (icon) icon.textContent = ICON[p];
    var btn = document.getElementById("theme-btn");
    if (btn) btn.title = "Тема: " + LABEL[p] + " — нажми, чтобы сменить";
  }

  document.addEventListener("DOMContentLoaded", function () {
    apply();
    var btn = document.getElementById("theme-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        try { localStorage.setItem("nl-theme", ORDER[pref()]); } catch (e) {}
        apply();
      });
    }
    if (window.matchMedia) {
      var mq = matchMedia("(prefers-color-scheme: dark)");
      var onSys = function () { if (pref() === "auto") apply(); };
      if (mq.addEventListener) mq.addEventListener("change", onSys);
      else if (mq.addListener) mq.addListener(onSys);
    }
  });

  apply();
})();
