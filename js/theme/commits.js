(function () {
  var API = 'https://api.github.com/repos/yaoyuana/Blog/commits?page=1&per_page=50';
  var TOKEN = 'token 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';
  var SPEED = 14;
  var box = document.getElementById('moocBox');
  var track = document.getElementById('commits-track');
  var con1 = document.getElementById('con1');
  var con2 = document.getElementById('con2');
  var root = document.getElementById('commits');
  if (!box || !track || !con1 || !con2 || !root) return;

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function firstLine(message) {
    return String(message || '').split('\n')[0].trim() || 'update';
  }

  function formatDate(iso) {
    return iso && iso.length >= 10 ? iso.slice(5, 10) : '';
  }

  function render(rows) {
    var html = '';
    rows.forEach(function (item, index) {
      var commit = item.commit || {};
      var message = firstLine(commit.message);
      var date = formatDate((commit.committer && commit.committer.date) || (commit.author && commit.author.date));
      var url = item.html_url || '#';
      html += '<li' + (index === 0 ? ' class="is-latest"' : '') + '>';
      html += '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer" title="' + escapeHtml(message) + '">';
      html += escapeHtml(message);
      html += '</a><span>' + escapeHtml(date) + '</span></li>';
    });
    con1.innerHTML = html;
    con2.innerHTML = html;
    con2.setAttribute('aria-hidden', 'true');
  }

  function bindMotion() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var listHeight = con1.offsetHeight;
    if (reduce || listHeight <= box.clientHeight) {
      box.classList.add('is-held');
      con2.style.display = 'none';
      return;
    }

    var paused = false;
    var last = 0;
    var y = 0;
    var raf = 0;

    function wrapY() {
      if (listHeight <= 0) return;
      if (y >= listHeight) y -= listHeight;
      else if (y < 0) y += listHeight;
    }

    function tick(now) {
      if (!last) last = now;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!paused) {
        y += SPEED * dt;
        wrapY();
        box.scrollTop = y;
      }
      raf = requestAnimationFrame(tick);
    }

    function hold() {
      paused = true;
      y = box.scrollTop;
      box.classList.add('is-held');
    }

    function release() {
      y = box.scrollTop;
      wrapY();
      box.scrollTop = y;
      last = 0;
      paused = false;
      box.classList.remove('is-held');
    }

    box.addEventListener('pointerenter', hold);
    box.addEventListener('pointerleave', release);
    box.addEventListener('wheel', hold, { passive: true });
    box.addEventListener('pointerdown', hold);
    box.addEventListener('focusin', hold);
    box.addEventListener('focusout', function (event) {
      if (!box.contains(event.relatedTarget)) release();
    });
    raf = requestAnimationFrame(tick);
  }

  fetch(API, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: TOKEN
    }
  })
    .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
    .then(function (data) {
      if (!data || !data.length) {
        root.style.display = 'none';
        return;
      }
      render(data);
      root.style.display = 'block';
      requestAnimationFrame(bindMotion);
    })
    .catch(function () {
      root.style.display = 'none';
    });
})();
