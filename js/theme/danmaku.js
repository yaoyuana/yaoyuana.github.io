(function () {
  var TWI_ENV = 'https://twikoo.yaoyuan.vip/.netlify/functions/twikoo';
  var DANMAKU_PATH = '/danmaku';
  var COLORS = ['#c1121f', '#7b2cbf', '#0077b6', '#2d6a4f', '#ee6c4d', '#3d5a80', '#d62828', '#6a4c93'];
  var FALLBACK = ['来填一条弹幕吧~', '首页也可以说话喔'];

  var stage = document.getElementById('danmaku-stage');
  var btn = document.getElementById('danmaku-fill-btn');
  var modal = document.getElementById('danmaku-modal');
  var closeBtn = document.getElementById('danmaku-close');
  var twikooBox = document.getElementById('danmaku-twikoo');
  if (!stage || !btn || !modal) return;

  var list = [];
  var cursor = 0;
  var lane = 0;
  var inited = false;
  var timer = null;
  var seen = {};

  function stripHtml(html) {
    var box = document.createElement('div');
    box.innerHTML = html || '';
    return (box.textContent || box.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function normalize(item) {
    var text = item.commentText || stripHtml(item.comment || item.commentHTML || '');
    if (!text) return null;
    if (text.length > 42) text = text.slice(0, 42) + '…';
    return {
      id: item.id || item._id || text,
      nick: item.nick || '路过的',
      text: text
    };
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

  function spawn(item) {
    if (!item || !item.text) return;
    var el = document.createElement('div');
    el.className = 'danmaku-item';
    var nick = document.createElement('span');
    nick.className = 'danmaku-nick';
    nick.textContent = item.nick;
    var body = document.createElement('span');
    body.textContent = item.text;
    el.appendChild(nick);
    el.appendChild(body);
    var top = 80 + (lane % 8) * 46 + Math.round(Math.random() * 10);
    lane += 1;
    el.style.top = top + 'px';
    el.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.animationDuration = 9 + Math.random() * 7 + 's';
    stage.appendChild(el);
    el.addEventListener('animationend', function () {
      el.remove();
    });
  }

  function tick() {
    if (!list.length) return;
    spawn(list[cursor % list.length]);
    cursor += 1;
  }

  function startLoop() {
    if (timer) return;
    tick();
    timer = setInterval(tick, 1400);
  }

  function applyList(items) {
    if (!items.length) {
      list = FALLBACK.map(function (text, i) {
        return { id: 'fallback-' + i, nick: 'yaoyuan', text: text };
      });
    } else {
      list = items;
    }
    items.forEach(function (item) { seen[item.id] = true; });
    startLoop();
  }

  function refreshNew() {
    fetchDanmaku().then(function (items) {
      if (!items.length) return;
      var fresh = items.filter(function (item) { return !seen[item.id]; });
      if (!list.length || (list[0] && String(list[0].id).indexOf('fallback-') === 0)) {
        applyList(items);
        return;
      }
      fresh.reverse().forEach(function (item) {
        seen[item.id] = true;
        list.unshift(item);
        spawn(item);
      });
    }).catch(function () {});
  }

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (inited || !window.twikoo) return;
    inited = true;
    twikoo.init({
      envId: TWI_ENV,
      el: '#danmaku-twikoo',
      path: DANMAKU_PATH,
      lang: 'zh-CN',
      onCommentLoaded: function () {
        refreshNew();
      }
    });
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  fetchDanmaku()
    .then(applyList)
    .catch(function () { applyList([]); });
})();
