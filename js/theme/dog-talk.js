(function () {
  var dog = document.querySelector('.dog');
  if (!dog) return;

  var LINES = {
    blank: [
      '这儿？行，我守着。',
      '空白也挺好，不踩到字。',
      '再点远一点，我腿短。',
      '到了。你要是不说话，我就摇尾巴。',
      '这边风大，我趴会儿。',
      '你很闲。我看出来了。',
      '行吧。走过去。别指望我谢谢你。',
      '走过去。这就是你今天全部的互动。',
      '地上什么都没有。跟你的计划一样。',
      '行，我去。你继续假装在看文章。',
      '你点的地方毫无意义。我还是去。',
      '跑这一趟，不值。'
    ],
    blankStreak: [
      '你连续点，我当跑步机了。',
      '手停一下。我不是解压玩具。'
    ],
    poke: [
      '别点我脸上，痒。',
      '说了痒。耳朵是装饰。',
      '痒。你听不懂人话，也听不懂狗话。',
      '欺负到我头上了。',
      '我要找主人告状！！'
    ],
    link: [
      '那个能点，我不挡。',
      '去的话带我？……也行，你去吧。'
    ],
    self: [
      '功能就这些：走、停、说话。别期待我写代码。',
      '你要留言就去文章底下。点我只会让我跑过去。'
    ],
    hour: {
      0: ['新的一天。站还在，我也在。'],
      7: ['早。顶栏那颗星已经转很久了。'],
      9: ['上班点。你可以装没看见我。'],
      12: ['十二点。午饭自己想办法。'],
      18: ['傍晚。适合发呆，不适合写周报。'],
      22: ['晚了。页面可以留着明天再翻。'],
      23: ['快十二点。站点从 2022 年一直亮到现在。']
    },
    period: {
      morning: ['天刚亮，适合看天气，不适合做决定。'],
      afternoon: ['这个点最容易拖更。我懂。'],
      night: ['你还在翻，我负责眨眼。']
    },
    update: [
      '最近更新：《{标题}》。',
      '有人刚翻完《{标题}》。拖更是传统。'
    ],
    updateToday: ['今天刚写下的。热乎的，小心烫。'],
    updateStale: ['主人又在酝酿。我先帮你看门。'],
    weatherClear: [
      '{地}今天晒。你晒，我躲阴影。',
      '晴得过分。适合出门，也适合摆烂。'
    ],
    weatherCloud: [
      '{地}阴着。我这种毛色显脏，先不打滚。',
      '云很多。像还没想好要不要下雨。'
    ],
    weatherRain: [
      '{地}在下雨，{温度}°。我像素的，淋不湿，你不行。',
      '雨点挺密。伞自己想办法，我只管摇。',
      '下雨。你出门会狼狈。我不会。'
    ],
    weatherSnow: ['{地}下雪了。我可以装雪雕，你别真的堆我。'],
    weatherFog: ['雾。十米外的链接我看不清，你看着点。'],
    weatherStorm: ['打雷了。我不怕，但我可以装怕，你哄一下。'],
    weatherHot: ['{地} {温度}°，体感 {体感}°。我建议你喝水，我建议我睡觉。'],
    weatherCold: ['这个温度适合钻被窝。页面没有被窝，勉强用空白处。'],
    weatherFallback: [
      '定位被你拒绝了。那我宣布：今天西安说了算。',
      '西安今天 {天气}，{温度}°。你要是不在那儿，当我念错。',
      '你人在哪我还没闻出来。先按西安播。'
    ],
    visitFirst: ['新味道。首页有弹幕球，侧栏有钟，我是会走的那个。'],
    visitBack: [
      '又见面。尾巴记得你。',
      '又来。收藏夹里还有别的站，你就记得这。',
      '欢迎回来。其实也没有很欢迎。',
      '还坐着。屏幕亮着不算勤奋。'
    ],
    visitLong: [
      '你消失挺久。文章还在，我也还在。',
      '隔了这么久。以为你把网址忘了。'
    ],
    idle: [
      '还在吗。我可以继续当屏保。',
      '一直没点。我怀疑你去倒水了。',
      '你要是走了，记得关灯。我关不了。',
      '你要么去倒水，要么已经魂飞了。',
      '走可以。别假装依依不舍。',
      '关页面前不用跟我告别。我记不住。',
      '主人在拖更。我在值班。你在浪费时间。',
      '新文章没有。你刷新也没有。',
      '建站好几年了。你还在点狗。',
      '客服不在。永远不在。我就是门垫。',
      '功能就这些。失望可以，别投诉。'
    ],
    footer: [
      '这是底。建站那天开始算，已经跑了很久。',
      '再往下没有了。除非你想看我的脚。'
    ],
    page: {
      gannan: ['油耗和海拔我都不懂，风景我装懂。'],
      parrot: ['那只鸟比我能转。我不跟它比。'],
      crush: ['这页有点甜。我去旁边待着。'],
      photo: ['别把我编进相簿，我没同意。'],
      links: ['去串门。我看家，不看评论。'],
      about: ['哔哔还在。短的那些，比我话少。'],
      me: ['这是主人的角落。我坐门口。'],
      archives: ['按年翻。2022 年我还没入职。'],
      zone: ['那是游戏区。我是装饰品，不参战。']
    },
    festStar: ['顶上那颗星在转。我负责地面。'],
    festNewYear: ['跨年了。拖更可以明年继续。'],
    festBirthday: ['这一天站点出生。我后来才来的。'],
    danmaku: ['有人刚在弹幕里说话。我听得见，回不了。'],
    rainBlank: ['雨天适合点空白。我来了，地板是干的。']
  };

  var INTERACTIVE = 'a, button, input, textarea, select, summary, label, .back-to-top, [role="button"]';
  var VISIT_KEY = 'yy-dog-visit';
  var bubble = null;
  var textEl = null;
  var hideTimer = 0;
  var followRaf = 0;
  var lastLine = '';
  var lastSpeak = 0;
  var blankStreak = 0;
  var blankTimer = 0;
  var latest = null;
  var idleTimer = 0;
  var said = {
    greet: false,
    weather: false,
    danmaku: false,
    footer: false,
    idle: false,
    page: false
  };

  function pick(list) {
    if (!list || !list.length) return '';
    if (list.length === 1) return list[0];
    var pool = list.filter(function (item) { return item !== lastLine; });
    if (!pool.length) pool = list;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function fill(line, map) {
    if (!line) return '';
    return line.replace(/\{([^}]+)\}/g, function (_, key) {
      return map && map[key] != null ? String(map[key]) : '';
    });
  }

  function dogVisible() {
    var style = window.getComputedStyle(dog);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function weatherMap() {
    var w = window.yyWeather || {};
    return {
      地: w.place || '这儿',
      温度: w.temp == null ? '--' : w.temp,
      体感: w.feel == null ? '--' : w.feel,
      天气: w.desc || '天气'
    };
  }

  function buildBubble() {
    bubble = document.createElement('div');
    bubble.className = 'dog-bubble';
    bubble.setAttribute('aria-live', 'polite');
    textEl = document.createElement('p');
    textEl.className = 'dog-bubble-text';
    bubble.appendChild(textEl);
    document.body.appendChild(bubble);
  }

  function placeBubble() {
    if (!bubble || !dogVisible()) return;
    var rect = dog.getBoundingClientRect();
    var width = bubble.offsetWidth || 180;
    var height = bubble.offsetHeight || 48;
    var left = rect.left + rect.width * 0.52;
    if (left + width > window.innerWidth - 10) left = window.innerWidth - width - 10;
    if (left < 8) left = 8;
    var top = rect.top - height - 8;
    if (top < 8) top = Math.min(rect.bottom + 8, window.innerHeight - height - 8);
    bubble.style.left = Math.round(left) + 'px';
    bubble.style.top = Math.round(top) + 'px';
  }

  function stopFollow() {
    if (followRaf) cancelAnimationFrame(followRaf);
    followRaf = 0;
  }

  function startFollow() {
    stopFollow();
    function tick() {
      placeBubble();
      followRaf = requestAnimationFrame(tick);
    }
    tick();
  }

  function hideBubble() {
    if (!bubble) return;
    bubble.classList.remove('is-on');
    stopFollow();
  }

  function dogIsWalking() {
    return !!(window.yyDogWalking);
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    if (!bubble || !bubble.classList.contains('is-on')) return;
    if (dogIsWalking()) return;
    hideTimer = setTimeout(hideBubble, 3000);
  }

  function speak(line, opt) {
    opt = opt || {};
    if (!line || !dogVisible()) return false;
    var now = Date.now();
    if (!opt.force && now - lastSpeak < 900 && bubble && bubble.classList.contains('is-on')) return false;
    lastLine = line;
    lastSpeak = now;
    textEl.textContent = line;
    bubble.classList.add('is-on');
    placeBubble();
    startFollow();
    scheduleHide();
    return true;
  }

  function storageGet(key, store) {
    try {
      return (store || localStorage).getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSet(key, value, store) {
    try {
      (store || localStorage).setItem(key, value);
    } catch (e) {}
  }

  function onceSession(key) {
    if (storageGet(key, sessionStorage)) return false;
    storageSet(key, '1', sessionStorage);
    return true;
  }

  function onceDay(key) {
    var today = new Date().toISOString().slice(0, 10);
    var stamp = storageGet(key);
    if (stamp === today) return false;
    storageSet(key, today);
    return true;
  }

  function visitKind() {
    var now = Date.now();
    try {
      var raw = storageGet(VISIT_KEY);
      if (!raw) {
        storageSet(VISIT_KEY, JSON.stringify({ first: now, last: now }));
        return 'first';
      }
      var rec = JSON.parse(raw);
      var gap = now - (rec.last || rec.first || now);
      rec.last = now;
      storageSet(VISIT_KEY, JSON.stringify(rec));
      if (gap > 30 * 24 * 60 * 60 * 1000) return 'long';
      if (gap > 3 * 60 * 60 * 1000) return 'back';
      return 'same';
    } catch (e) {
      return 'same';
    }
  }

  function pageKind() {
    var path = decodeURIComponent(location.pathname || '');
    if (/甘南/.test(path)) return 'gannan';
    if (/鹦鹉记/.test(path)) return 'parrot';
    if (/Crush|什么是Crush/i.test(path) || /\/16-/.test(path)) return 'crush';
    if (/^\/photo/.test(path)) return 'photo';
    if (/^\/links/.test(path)) return 'links';
    if (/^\/about/.test(path)) return 'about';
    if (/^\/me/.test(path)) return 'me';
    if (/^\/archives/.test(path)) return 'archives';
    if (/^\/ZONE/i.test(path) || /\/Circle/.test(path)) return 'zone';
    return '';
  }

  function festivalLine() {
    var now = new Date();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    if (m === 10 && d === 14) return pick(LINES.festBirthday);
    if (m === 1 && d === 1) return pick(LINES.festNewYear);
    if (m === 12 && d >= 24 && d <= 26) return pick(LINES.festStar);
    return '';
  }

  function weatherLine() {
    var w = window.yyWeather;
    if (!w) return '';
    var map = weatherMap();
    if (!w.ok) return fill(pick(LINES.weatherFallback), map);
    if (w.usedFallback) return fill(pick(LINES.weatherFallback), map);
    if (w.temp != null && w.temp >= 32) return fill(pick(LINES.weatherHot), map);
    if (w.temp != null && w.temp <= 2) return fill(pick(LINES.weatherCold), map);
    var icon = w.icon || '';
    if (icon === 'storm' || /雷/.test(w.desc || '')) return fill(pick(LINES.weatherStorm), map);
    if (icon === 'snow' || /雪/.test(w.desc || '')) return fill(pick(LINES.weatherSnow), map);
    if (icon === 'fog' || /雾/.test(w.desc || '')) return fill(pick(LINES.weatherFog), map);
    if (icon === 'rain' || icon === 'drizzle' || /雨/.test(w.desc || '')) return fill(pick(LINES.weatherRain), map);
    if (icon === 'overcast' || icon === 'partly' || icon === 'partly-night' || /阴|多云/.test(w.desc || '')) {
      return fill(pick(LINES.weatherCloud), map);
    }
    return fill(pick(LINES.weatherClear), map);
  }

  function updateLine() {
    if (!latest || !latest.title) return '';
    var map = { 标题: latest.title, 日期: latest.date || '' };
    if (latest.date) {
      var today = new Date();
      var y = today.getFullYear();
      var m = String(today.getMonth() + 1);
      var d = String(today.getDate());
      if (m.length < 2) m = '0' + m;
      if (d.length < 2) d = '0' + d;
      var stamp = y + '-' + m + '-' + d;
      if (latest.date === stamp) return fill(pick(LINES.updateToday), map);
      var then = new Date(latest.date + 'T00:00:00');
      if (!isNaN(then.getTime()) && Date.now() - then.getTime() > 40 * 24 * 60 * 60 * 1000) {
        return fill(pick(LINES.updateStale), map);
      }
    }
    return fill(pick(LINES.update), map);
  }

  function hourLine(hour) {
    var list = LINES.hour[hour];
    if (list) return pick(list);
    return hour + ' 点整。我报时，不加班。';
  }

  function periodLine() {
    var hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return pick(LINES.period.morning);
    if (hour >= 13 && hour < 18) return pick(LINES.period.afternoon);
    if (hour >= 22 || hour < 5) return pick(LINES.period.night);
    return '';
  }

  function greet() {
    if (said.greet || !dogVisible()) return;
    var visit = visitKind();
    var fest = festivalLine();
    if (fest && onceDay('yy-dog-fest')) {
      said.greet = true;
      speak(fest);
      return;
    }
    var kind = pageKind();
    if (kind && LINES.page[kind] && onceSession('yy-dog-page-' + kind)) {
      said.greet = true;
      said.page = true;
      speak(pick(LINES.page[kind]));
      return;
    }
    if (visit === 'first' && onceSession('yy-dog-visit-line')) {
      said.greet = true;
      speak(pick(LINES.visitFirst));
      return;
    }
    if (visit === 'long' && onceSession('yy-dog-visit-line')) {
      said.greet = true;
      speak(pick(LINES.visitLong));
      return;
    }
    if (visit === 'back' && onceSession('yy-dog-visit-line')) {
      said.greet = true;
      speak(pick(LINES.visitBack));
      return;
    }
    var update = updateLine();
    if (update && onceDay('yy-dog-update')) {
      said.greet = true;
      speak(update);
      return;
    }
    var weather = weatherLine();
    if (weather && onceSession('yy-dog-weather')) {
      said.greet = true;
      said.weather = true;
      speak(weather);
      return;
    }
    var period = periodLine();
    if (period && onceSession('yy-dog-period')) {
      said.greet = true;
      speak(period);
    }
  }

  function isInteractive(node) {
    return !!(node && node.closest && node.closest(INTERACTIVE));
  }

  function nearDog(event) {
    var rect = dog.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top && event.clientY <= rect.bottom;
  }

  function onClick(event) {
    if (!dogVisible()) return;
    bumpIdle();
    if (isInteractive(event.target)) {
      blankStreak = 0;
      speak(pick(LINES.link.concat(LINES.self)), { force: true });
      return;
    }
    if (nearDog(event)) {
      blankStreak = 0;
      speak(pick(LINES.poke), { force: true });
      return;
    }
    blankStreak += 1;
    clearTimeout(blankTimer);
    blankTimer = setTimeout(function () { blankStreak = 0; }, 4000);
    var w = window.yyWeather;
    var rainy = w && (/雨/.test(w.desc || '') || w.icon === 'rain' || w.icon === 'drizzle');
    var line = '';
    if (blankStreak >= 3) line = pick(LINES.blankStreak);
    else if (rainy && Math.random() < 0.45) line = pick(LINES.rainBlank);
    else line = pick(LINES.blank);
    speak(line, { force: true });
  }

  function armHour() {
    var now = new Date();
    var wait = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds() + 80;
    setTimeout(function tickHour() {
      if (document.visibilityState === 'visible' && dogVisible()) {
        speak(hourLine(new Date().getHours()));
      }
      armHour();
    }, Math.max(wait, 1000));
  }

  function bumpIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (document.visibilityState !== 'visible') {
        bumpIdle();
        return;
      }
      speak(pick(LINES.idle));
      bumpIdle();
    }, 15 * 1000);
  }

  function watchFooter() {
    var foot = document.getElementById('colophon') || document.getElementById('runtime');
    if (!foot || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || said.footer) return;
        said.footer = true;
        speak(pick(LINES.footer));
      });
    }, { threshold: 0.4 });
    io.observe(foot);
  }

  function loadLatest() {
    return fetch('/dog-latest.json')
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (data && data.title) latest = data;
        return latest;
      })
      .catch(function () { return null; });
  }

  buildBubble();
  window.addEventListener('resize', placeBubble);
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', bumpIdle);
  document.addEventListener('scroll', bumpIdle, { passive: true });
  window.addEventListener('yy-dog-walk', function () {
    window.yyDogWalking = true;
    clearTimeout(hideTimer);
  });
  window.addEventListener('yy-dog-stop', function () {
    window.yyDogWalking = false;
    scheduleHide();
  });
  bumpIdle();
  armHour();
  watchFooter();

  window.addEventListener('yy-weather', function () {
    if (said.weather || said.greet) return;
    var line = weatherLine();
    if (!line || !onceSession('yy-dog-weather')) return;
    said.weather = true;
    speak(line);
  });

  window.addEventListener('yy-danmaku', function () {
    if (said.danmaku || !onceSession('yy-dog-danmaku')) return;
    said.danmaku = true;
    setTimeout(function () {
      if (dogVisible()) speak(pick(LINES.danmaku));
    }, 14000);
  });

  setTimeout(function () {
    loadLatest().then(function () { greet(); });
  }, 1500);
})();
