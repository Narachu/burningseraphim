var TRACKS = [
  "first beat",
  "Shit Slop Beat",
  "Tritater Is a Dork",
  "alien shit",
  "minecraft ass beat",
  "beat 5 + Todd"
];

var PHOTOS = [
  "library1.png", "library2.png", "library3.jpg", "library4.jpg", "library5.jpg",
  "library6.webp", "library7.png", "library8.png", "library9.png", "library10.png",
  "library11.png", "library12.gif", "library13.png", "library15.png", 
  "library18.webp", "library20.png", "library21.png",
  "library22.webp", "library23.jpg",
  "library30.jpg", "library31.jpg", "library32.jpg", "library33.jpg", "library34.png", "library35.png", "library36.jpg", "library37.png", "library38.png", "library39.png", "library40.png", "library41.png", "library42.png", "library43.png", "library44.png", "library45.png", "library46.png", "library47.png", "library48.jpg", "library49.jpg", "library50.jpg", "library51.jpg", "library52.jpg"
];

(function () {
  var root = document.body.dataset.root || "";
  var html = document.documentElement;

  function photoFull(name) { return root + "images/library/" + name; }
  function photoThumb(name) {
    return /\.gif$/i.test(name) ? photoFull(name) : root + "images/library/thumbs/" + name.replace(/\.\w+$/, ".jpg");
  }
  function trackSrc(name) { return encodeURI(root + "audio/" + name + ".mp3"); }
  function fmt(s) {
    if (!isFinite(s)) return "0:00";
    s = Math.floor(s);
    return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  var themeButtons = document.querySelectorAll("[data-set-theme]");
  function applyTheme(name) {
    html.dataset.theme = name;
    themeButtons.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.setTheme === name); });
    try { localStorage.setItem("theme", name); } catch (e) {}
  }
  themeButtons.forEach(function (b) { b.addEventListener("click", function () { applyTheme(b.dataset.setTheme); }); });
  applyTheme(html.dataset.theme || "ember");

  document.querySelectorAll(".win").forEach(function (win) {
    var bar = win.querySelector(".win-bar");
    if (!bar) return;
    var btns = el("span", "win-btns");
    [["min", "–", "minimize"], ["max", "□", "restore"], ["close", "×", "close"]].forEach(function (b) {
      var btn = el("button", "win-" + b[0], b[1]);
      btn.type = "button";
      btn.setAttribute("aria-label", b[2]);
      btns.appendChild(btn);
    });
    bar.appendChild(btns);
    btns.addEventListener("click", function (e) {
      var t = e.target.closest("button");
      if (!t) return;
      if (t.classList.contains("win-min")) win.classList.add("collapsed");
      if (t.classList.contains("win-max")) win.classList.remove("collapsed");
      if (t.classList.contains("win-close")) win.classList.add("closed");
    });
  });

  var audio = new Audio();
  audio.preload = "metadata";
  var current = -1;
  var listeners = [];
  function notify() { listeners.forEach(function (f) { f(); }); }
  function play(i) {
    if (i !== current) {
      current = i;
      audio.src = trackSrc(TRACKS[i]);
    }
    audio.play();
    notify();
  }
  function toggle(i) {
    if (i === current && !audio.paused) { audio.pause(); notify(); }
    else play(i);
  }
  ["play", "pause", "timeupdate", "loadedmetadata"].forEach(function (ev) { audio.addEventListener(ev, notify); });
  audio.addEventListener("ended", function () { play((current + 1) % TRACKS.length); });
  function seekFrom(bar, e) {
    if (!audio.duration) return;
    var r = bar.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * audio.duration;
  }

  var mini = document.getElementById("mini-player");
  if (mini && TRACKS.length) {
    var start = Math.floor(Math.random() * TRACKS.length);
    var title = el("div", "mp-title", TRACKS[start]);
    var row = el("div", "mp-row");
    var prev = el("button", "mp-btn", "⏮");
    var pp = el("button", "mp-btn mp-play", "▶");
    var next = el("button", "mp-btn", "⏭");
    var time = el("span", "mp-time", "0:00");
    var bar = el("div", "seek");
    var fill = el("div", "seek-fill");
    bar.appendChild(fill);
    [prev, pp, next].forEach(function (b) { b.type = "button"; row.appendChild(b); });
    row.appendChild(time);
    mini.append(title, bar, row);
    prev.addEventListener("click", function () { play(((current < 0 ? start : current) - 1 + TRACKS.length) % TRACKS.length); });
    next.addEventListener("click", function () { play(((current < 0 ? start : current) + 1) % TRACKS.length); });
    pp.addEventListener("click", function () { toggle(current < 0 ? start : current); });
    bar.addEventListener("click", function (e) { seekFrom(bar, e); });
    listeners.push(function () {
      var i = current < 0 ? start : current;
      title.textContent = TRACKS[i];
      pp.textContent = !audio.paused && current >= 0 ? "❚❚" : "▶";
      time.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration);
      fill.style.width = audio.duration ? (audio.currentTime / audio.duration * 100) + "%" : "0";
    });
  }

  var list = document.getElementById("track-list");
  if (list) {
    TRACKS.forEach(function (name, i) {
      var row = el("div", "track");
      var btn = el("button", "track-play", "▶");
      btn.type = "button";
      btn.setAttribute("aria-label", "play " + name);
      var info = el("div", "track-info");
      var t = el("div", "track-title", name);
      var bar = el("div", "seek");
      var fill = el("div", "seek-fill");
      bar.appendChild(fill);
      info.append(t, bar);
      var time = el("span", "track-time", "–:––");
      var probe = new Audio();
      probe.preload = "metadata";
      probe.src = trackSrc(name);
      probe.addEventListener("loadedmetadata", function () { if (current !== i) time.textContent = fmt(probe.duration); });
      row.append(btn, info, time);
      list.appendChild(row);
      btn.addEventListener("click", function () { toggle(i); });
      bar.addEventListener("click", function (e) { if (current === i) seekFrom(bar, e); else play(i); });
      listeners.push(function () {
        var on = current === i;
        row.classList.toggle("playing", on);
        btn.textContent = on && !audio.paused ? "❚❚" : "▶";
        fill.style.width = on && audio.duration ? (audio.currentTime / audio.duration * 100) + "%" : "0";
        if (on) time.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration);
        else if (probe.duration) time.textContent = fmt(probe.duration);
      });
    });
  }

  var rand = document.getElementById("random-photo");
  if (rand && PHOTOS.length) {
    var img = el("img");
    img.alt = "random photo";
    var link = el("a");
    link.href = root + "html/photo_album.html";
    link.appendChild(img);
    var reroll = el("button", "reroll", "reroll");
    reroll.type = "button";
    rand.append(link, reroll);
    var last = -1;
    function pick() {
      var i;
      do { i = Math.floor(Math.random() * PHOTOS.length); } while (i === last && PHOTOS.length > 1);
      last = i;
      img.src = photoThumb(PHOTOS[i]);
    }
    reroll.addEventListener("click", pick);
    pick();
  }

  var gallery = document.getElementById("gallery");
  if (gallery) {
    var box = el("div", "lightbox");
    var big = el("img");
    var cap = el("div", "lb-cap");
    var lbPrev = el("button", "lb-btn lb-prev", "‹");
    var lbNext = el("button", "lb-btn lb-next", "›");
    var lbClose = el("button", "lb-btn lb-close", "×");
    [lbPrev, lbNext, lbClose].forEach(function (b) { b.type = "button"; });
    box.append(big, cap, lbPrev, lbNext, lbClose);
    document.body.appendChild(box);
    var at = 0;
    function show(i) {
      at = (i + PHOTOS.length) % PHOTOS.length;
      big.src = photoFull(PHOTOS[at]);
      cap.textContent = (at + 1) + " / " + PHOTOS.length;
      box.classList.add("open");
    }
    function hide() { box.classList.remove("open"); big.removeAttribute("src"); }
    PHOTOS.forEach(function (name, i) {
      var b = el("button", "thumb");
      b.type = "button";
      var t = el("img");
      t.src = photoThumb(name);
      t.alt = "photo " + (i + 1);
      t.loading = "lazy";
      b.style.setProperty("--r", [-3, 2, -1.5, 3, -2.5, 1.5, -1, 2.5][i % 8] + "deg");
      b.appendChild(t);
      b.addEventListener("click", function () { show(i); });
      gallery.appendChild(b);
    });
    lbPrev.addEventListener("click", function (e) { e.stopPropagation(); show(at - 1); });
    lbNext.addEventListener("click", function (e) { e.stopPropagation(); show(at + 1); });
    lbClose.addEventListener("click", hide);
    box.addEventListener("click", function (e) { if (e.target === box) hide(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowLeft") show(at - 1);
      if (e.key === "ArrowRight") show(at + 1);
    });
  }

  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var src = document.getElementById(b.dataset.copy);
      var text = src.value != null ? src.value : src.textContent;
      function done() { var o = b.textContent; b.textContent = "copied!"; setTimeout(function () { b.textContent = o; }, 1200); }
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { src.select && src.select(); });
      else { src.select && src.select(); document.execCommand("copy"); done(); }
    });
  });
})();
