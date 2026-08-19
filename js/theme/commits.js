(function () {
  var SPEED = 14;
  var TWI_ENV = 'https://twikoo.yaoyuan.vip/.netlify/functions/twikoo';
  var DANMAKU_PATH = '/danmaku';
  var FALLBACK = [{ nick: 'yaoyuan', text: '来填一条弹幕吧~', date: '' }];

  var box = document.getElementById('moocBox');
  var track = document.getElementById('commits-track');
  var con1 = document.getElementById('con1');
  var con2 = document.getElementById('con2');
  var root = document.getElementById('commits');
  if (!box || !track || !con1 || !con2 || !root) return;

  var mode = (root.getAttribute('data-mode') || 'sidebar').toLowerCase();

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function stripHtml(html) {
    var el = document.createElement('div');
    el.innerHTML = html || '';
    return (el.textContent || el.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function formatDate(created) {
    var d = new Date(created);
    if (isNaN(d.getTime())) return '';
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function normalize(item) {
    var text = item.commentText || stripHtml(item.comment || item.commentHTML || '');
    if (!text) return null;
    return {
      nick: item.nick || '路过的',
      text: text,
      date: formatDate(item.created)
    };
  }

  function render(rows) {
    var html = '';
    rows.forEach(function (item, index) {
      var label = item.nick ? item.nick + ' · ' + item.text : item.text;
      html += '<li' + (index === 0 ? ' class="is-latest"' : '') + '>';
      html += '<a href="javascript:void(0)" title="' + escapeHtml(label) + '">';
      html += escapeHtml(item.text);
      html += '</a><span>' + escapeHtml(item.date || item.nick || '') + '</span></li>';
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

  function showSidebar() {
    box.classList.add('is-held');
    con2.style.display = 'none';
  }

  function fetchDanmaku() {
    return fetch(TWI_ENV, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'COMMENT_GET', url: DANMAKU_PATH })
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        var rows = json && json.data ? json.data : [];
        var out = [];
        rows.forEach(function (row) {
          var item = normalize(row);
          if (item) out.push(item);
          (row.replies || []).forEach(function (reply) {
            var nested = normalize(reply);
            if (nested) out.push(nested);
          });
        });
        return out;
      });
  }

  fetchDanmaku()
    .then(function (data) {
      if (!data || !data.length) data = FALLBACK;
      render(data);
      root.style.display = 'block';
      if (mode === 'marquee') requestAnimationFrame(bindMotion);
      else showSidebar();
      try { window.dispatchEvent(new CustomEvent('yy-danmaku')); } catch (e) {}
    })
    .catch(function () {
      render(FALLBACK);
      root.style.display = 'block';
      showSidebar();
    });
})();
