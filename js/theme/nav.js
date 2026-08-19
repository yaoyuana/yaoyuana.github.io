/**
 * 试验性无感跳转（可整笔撤销）
 * 壳留下，只换 #content。ZONE 没有这套壳，仍整页走。
 * innerHTML 不会执行 script，换页后要按顺序重跑页面脚本。
 */
(function () {
  var TWI_ENV = 'https://twikoo.yaoyuan.vip/.netlify/functions/twikoo';
  var scripts = {};
  var nativeSetInterval = window.setInterval;
  var nativeSetTimeout = window.setTimeout;
  var capturedTimers = [];

  window.__yyPjaxLeaves = window.__yyPjaxLeaves || [];
  window.yyPjaxOnLeave = window.yyPjaxOnLeave || function (fn) {
    if (typeof fn === 'function') window.__yyPjaxLeaves.push(fn);
  };

  function pathOf(href) {
    try {
      return new URL(href, location.href).pathname;
    } catch (e) {
      return '';
    }
  }

  function absUrl(href) {
    try {
      return new URL(href.replace(/\\/g, '/'), location.href).href.split('#')[0];
    } catch (e) {
      return (href || '').replace(/\\/g, '/');
    }
  }

  function shouldHardNav(href) {
    var path = pathOf(href);
    if (!path) return true;
    if (/^\/ZONE\//i.test(path)) return true;
    return false;
  }

  function closestLink(node) {
    if (!node) return null;
    if (node.nodeType !== 1) node = node.parentElement;
    if (!node || !node.closest) return null;
    return node.closest('a');
  }

  function isShellSrc(src) {
    src = (src || '').replace(/\\/g, '/');
    if (/\/js\/theme\/(nav|dog|dog-talk|funnyTitle|footstep)\.js/i.test(src)) return true;
    if (/\/js\/theme\/theme\.js/i.test(src)) return true;
    if (/\/js\/Plugins\/jquery/i.test(src)) return true;
    if (/\/js\/Plugins\/bootstrap/i.test(src)) return true;
    if (/\/lib\/codeBlock\//i.test(src)) return true;
    if (/\/js\/theme\/comment\.js/i.test(src)) return true;
    if (/\/js\/theme\/link\.js/i.test(src)) return true;
    return false;
  }

  function isLibrarySrc(src) {
    src = (src || '').replace(/\\/g, '/');
    return /twikoo|view-image|locomotive-scroll|artitalk|neontext|matter\.js|scrollTrigger|gsap\.min|Valine|av-min/i.test(src);
  }

  function isGlobalOnceSrc(src) {
    src = (src || '').replace(/\\/g, '/');
    return /\/js\/posts\/(Slider|Card)\.js/i.test(src);
  }

  function hasScript(src) {
    var abs = absUrl(src);
    var nodes = document.getElementsByTagName('script');
    for (var i = 0; i < nodes.length; i++) {
      var value = nodes[i].getAttribute('src');
      if (value && absUrl(value) === abs) return true;
    }
    return false;
  }

  function wrapLocomotive() {
    var Orig = window.LocomotiveScroll;
    if (!Orig || Orig.__yyWrapped) return;
    function Wrapped(opts) {
      var inst = new Orig(opts);
      window.__yyLoco = inst;
      return inst;
    }
    Wrapped.prototype = Orig.prototype;
    Wrapped.__yyWrapped = true;
    window.LocomotiveScroll = Wrapped;
  }

  function loadScript(src) {
    src = src.replace(/\\/g, '/');
    var key = absUrl(src);
    if (scripts[key]) return scripts[key];
    if (src.indexOf('clipboard') !== -1 && window.ClipboardJS) {
      scripts[key] = Promise.resolve();
      return scripts[key];
    }
    if (src.indexOf('twikoo') !== -1 && window.twikoo) {
      scripts[key] = Promise.resolve();
      return scripts[key];
    }
    if (/view-image/i.test(src) && window.ViewImage) {
      scripts[key] = Promise.resolve();
      return scripts[key];
    }
    if (/artitalk/i.test(src) && window.Artitalk) {
      scripts[key] = Promise.resolve();
      return scripts[key];
    }
    if (/locomotive-scroll/i.test(src) && window.LocomotiveScroll) {
      wrapLocomotive();
      scripts[key] = Promise.resolve();
      return scripts[key];
    }
    if (/gsap\.min/i.test(src) && window.gsap) {
      scripts[key] = Promise.resolve();
      return scripts[key];
    }
    if (hasScript(src) && !isLibrarySrc(src) && isGlobalOnceSrc(src)) {
      scripts[key] = Promise.resolve();
      return scripts[key];
    }
    scripts[key] = new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      el.src = src;
      el.onload = function () {
        if (/locomotive-scroll/i.test(src)) wrapLocomotive();
        resolve();
      };
      el.onerror = reject;
      document.body.appendChild(el);
    });
    return scripts[key];
  }

  function evalPage(code, label) {
    try {
      var fn = new Function(code);
      fn.call(window);
    } catch (err) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[pjax script]', label || 'inline', err);
      }
    }
  }

  function collectScripts(doc, next) {
    var list = [];
    var seenSrc = {};
    var seenInline = {};

    function take(el) {
      if (!el || (el.tagName || '').toLowerCase() !== 'script') return;
      var type = (el.getAttribute('type') || 'text/javascript').toLowerCase();
      if (type && type !== 'text/javascript' && type !== 'application/javascript' && type !== 'application/ecmascript') {
        if (type !== '') return;
      }
      var src = el.getAttribute('src');
      if (src) {
        src = src.replace(/\\/g, '/');
        var key = absUrl(src);
        if (seenSrc[key]) return;
        seenSrc[key] = 1;
        if (isShellSrc(src)) return;
        list.push({ src: src, code: null });
        return;
      }
      var code = el.textContent || '';
      if (!code.trim()) return;
      var sig = code.replace(/\s+/g, ' ').slice(0, 160);
      if (seenInline[sig]) return;
      seenInline[sig] = 1;
      if (code.indexOf('MOBILE_NAV') !== -1) return;
      if (code.indexOf('__yyPjaxLeaves') !== -1 && code.length < 280) return;
      list.push({ src: null, code: code });
    }

    if (doc.head) doc.head.querySelectorAll('script').forEach(take);
    next.querySelectorAll('script').forEach(take);
    if (doc.body) {
      Array.prototype.forEach.call(doc.body.querySelectorAll('script'), function (el) {
        if (next.contains(el)) return;
        var src = el.getAttribute('src') || '';
        src = src.replace(/\\/g, '/');
        if (src && (isLibrarySrc(src) || /\/js\/posts\//i.test(src) || /\/js\/theme\/(danmaku|photo|weather|commits)/i.test(src))) {
          take(el);
          return;
        }
        if (!src && el.textContent && /Artitalk|photoAlbumImages|ViewImage|getClock|new Slider|new Card/.test(el.textContent)) {
          take(el);
        }
      });
    }
    return list;
  }

  function runOne(item) {
    if (!item.src) {
      evalPage(item.code, 'inline');
      return Promise.resolve();
    }
    var src = item.src.replace(/\\/g, '/');
    if (isLibrarySrc(src) || isGlobalOnceSrc(src)) {
      return loadScript(src);
    }
    return fetch(src, { cache: 'force-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('script ' + res.status);
        return res.text();
      })
      .then(function (code) {
        evalPage(code, src);
      });
  }

  function runScripts(items) {
    var i = 0;
    function next() {
      if (i >= items.length) return Promise.resolve();
      var item = items[i++];
      return runOne(item).catch(function (err) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[pjax script]', item.src || 'inline', err);
        }
      }).then(next);
    }
    return next();
  }

  function applyPageCss(doc, next) {
    document.querySelectorAll('link[data-pjax-css]').forEach(function (node) {
      node.remove();
    });
    var have = {};
    document.querySelectorAll('link[rel="stylesheet"]').forEach(function (link) {
      have[absUrl(link.href)] = 1;
    });
    var injected = {};
    var waits = [];
    function take(link) {
      var href = link.getAttribute('href');
      if (!href) return;
      href = href.replace(/\\/g, '/');
      var key = absUrl(href);
      if (have[key] || injected[key]) return;
      injected[key] = 1;
      var el = document.createElement('link');
      el.rel = 'stylesheet';
      el.href = href;
      el.setAttribute('data-pjax-css', '1');
      waits.push(new Promise(function (resolve) {
        var done = false;
        function finish() {
          if (done) return;
          done = true;
          resolve();
        }
        el.addEventListener('load', finish);
        el.addEventListener('error', finish);
        setTimeout(finish, 2000);
        document.head.appendChild(el);
        try {
          if (el.sheet) finish();
        } catch (e) {}
      }));
    }
    if (doc.head) doc.head.querySelectorAll('link[rel="stylesheet"]').forEach(take);
    next.querySelectorAll('link[rel="stylesheet"]').forEach(take);
    return Promise.all(waits);
  }

  function closeMobileNav() {
    var ipt = document.getElementById('ipt');
    var navBar = document.getElementById('nav-top');
    if (!ipt || !navBar) return;
    if (document.body.clientWidth < 480) {
      ipt.checked = false;
      navBar.style.right = '-240px';
    }
  }

  function stopTimerCapture() {
    window.setInterval = nativeSetInterval;
    window.setTimeout = nativeSetTimeout;
  }

  function clearCapturedTimers() {
    capturedTimers.forEach(function (item) {
      if (item.kind === 'i') window.clearInterval(item.id);
      else window.clearTimeout(item.id);
    });
    capturedTimers = [];
    stopTimerCapture();
  }

  function startTimerCapture() {
    clearCapturedTimers();
    window.setInterval = function () {
      var id = nativeSetInterval.apply(window, arguments);
      capturedTimers.push({ kind: 'i', id: id });
      return id;
    };
    window.setTimeout = function () {
      var id = nativeSetTimeout.apply(window, arguments);
      capturedTimers.push({ kind: 't', id: id });
      return id;
    };
  }

  function destroyNamed() {
    ['yyDestroyPlane', 'yyDestroyDanmaku', 'yyDestroyPhoto', 'yyDestroyMenu', 'yyDestroyCommits', 'yyDestroyLoco'].forEach(function (name) {
      if (typeof window[name] === 'function') {
        try { window[name](); } catch (e) {}
        window[name] = null;
      }
    });
  }

  function beforeSwap() {
    var leaves = window.__yyPjaxLeaves || [];
    window.__yyPjaxLeaves = [];
    leaves.forEach(function (fn) {
      try { fn(); } catch (e) {}
    });
    destroyNamed();
    clearCapturedTimers();
    try {
      if (window.__yyLoco && typeof window.__yyLoco.destroy === 'function') {
        window.__yyLoco.destroy();
      }
    } catch (e) {}
    window.__yyLoco = null;
    var dog = document.querySelector('.dog');
    if (dog) dog.style.display = '';
    document.body.style.overflow = '';
    document.documentElement.classList.remove(
      'has-scroll-smooth',
      'has-scroll-init',
      'has-scroll-scrolling',
      'has-scroll-dragging'
    );
    document.querySelectorAll('span.temp').forEach(function (node) {
      node.remove();
    });
  }

  function initComments() {
    var box = document.getElementById('tcomment');
    if (!box) return;
    box.innerHTML = '';
    loadScript('/js/Plugins/twikoo.min.js').then(function () {
      if (!window.twikoo) return;
      window.twikoo.init({
        envId: TWI_ENV,
        el: '#tcomment'
      });
    }).catch(function () {});
  }

  function initLinks() {
    if (typeof window.yyInitLinks === 'function') {
      window.yyInitLinks();
      return;
    }
    var mount = document.querySelector('.link-navigation');
    if (!mount) return;
    loadScript('/js/theme/link.js').then(function () {
      if (typeof window.yyInitLinks === 'function') window.yyInitLinks();
    }).catch(function () {});
  }

  function initCodeBlocks() {
    if (!window.jQuery) return;
    var $ = window.jQuery;
    var $pres = $('#content pre').filter(function () {
      return !$(this).parent().hasClass('code-area');
    });
    if (!$pres.length) return;

    function bind() {
      var expandDefault = $('[data-code-expanded]').length > 0;
      $pres.wrap('<div class="code-area' + (expandDefault ? '' : ' code-closed') + '" style="position: relative"></div>');
      $pres.after($('<div class="code_lang" title="代码语言"></div>'));
      $pres.each(function () {
        var code_language = $(this).attr('class');
        if (!code_language) return;
        var lang_name = code_language.replace('line-numbers', '').trim().replace('language-', '').trim();
        lang_name = lang_name.slice(0, 1).toUpperCase() + lang_name.slice(1);
        $(this).siblings('.code_lang').text(lang_name);
      });
      var $copyIcon = $('<i class="fa fa-copy code_copy" title="复制代码" aria-hidden="true"></i>');
      $('#content .code-area').prepend($copyIcon);
      if (window.ClipboardJS) {
        new window.ClipboardJS('#content .fa-copy', {
          target: function (trigger) { return trigger.nextElementSibling; }
        });
      }
      var $code_expand = $('<i class="fa fa-chevron-up code-expand" title="折叠代码" aria-hidden="true"></i>');
      $('#content .code-area').prepend($code_expand);
      if (!expandDefault) {
        $('#content .code-expand').siblings('pre').find('code').hide();
      }
      $('#content .code-expand').on('click', function () {
        if ($(this).parent().hasClass('code-closed')) {
          $(this).siblings('pre').find('code').show();
          $(this).parent().removeClass('code-closed');
        } else {
          $(this).siblings('pre').find('code').hide();
          $(this).parent().addClass('code-closed');
        }
      });
      $('#mulu .toc-item').each(function () {
        var text = $(this).find('.toc-text').text().trim();
        var $id = $('.post-content h1, .post-content h2, .post-content h3, .post-content h4')
          .find('span[id]')
          .filter(function () {
            return $(this).text().replace(/\s+/g, ' ').trim() === text;
          })
          .first();
        if ($id.length) {
          $(this).find('a.toc-link').attr('href', '#' + $id.attr('id'));
        }
      });
    }

    if (window.ClipboardJS) bind();
    else loadScript('/lib/codeBlock/clipboard.min.js').then(bind).catch(bind);
  }

  function initLazy() {
    document.querySelectorAll('#content img[data-original]').forEach(function (img) {
      var real = img.getAttribute('data-original');
      if (!real) return;
      if (img.getAttribute('src') !== real) img.src = real;
      img.removeAttribute('data-original');
    });
    document.querySelectorAll('#content [bg-lazy]').forEach(function (el) {
      el.removeAttribute('bg-lazy');
    });
    var setting = window.imageLazyLoadSetting;
    if (setting && typeof setting.processImages === 'function') {
      try { setting.processImages(true); } catch (e) {}
    }
  }

  function afterSwap() {
    document.body.style.overflow = '';
    initComments();
    initLinks();
    initCodeBlocks();
    initLazy();
  }

  function swap(html, url, push) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var next = doc.getElementById('content');
    var cur = document.getElementById('content');
    if (!next || !cur) {
      location.href = url;
      return Promise.resolve();
    }
    beforeSwap();
    var cssReady = applyPageCss(doc, next);
    var pageScripts = collectScripts(doc, next);
    next.querySelectorAll('script').forEach(function (node) {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
    cur.innerHTML = next.innerHTML;
    document.title = doc.title || document.title;
    if (doc.body && doc.body.className != null) {
      document.body.className = doc.body.className;
    }
    if (push) history.pushState({ yyPjax: 1 }, '', url);
    window.scrollTo(0, 0);
    closeMobileNav();
    startTimerCapture();
    return cssReady.then(function () {
      return runScripts(pageScripts);
    }).then(function () {
      afterSwap();
    }).then(function () {
      stopTimerCapture();
    }, function (err) {
      stopTimerCapture();
      throw err;
    });
  }

  var inflight = 0;
  function go(url, push) {
    var id = ++inflight;
    document.documentElement.classList.add('is-pjaxing');
    fetch(url, { headers: { 'X-Requested-With': 'yy-pjax' } })
      .then(function (res) {
        if (!res.ok) throw new Error('pjax ' + res.status);
        return res.text();
      })
      .then(function (html) {
        if (id !== inflight) return;
        return swap(html, url, push);
      })
      .catch(function () {
        location.href = url;
      })
      .then(function () {
        if (id === inflight) document.documentElement.classList.remove('is-pjaxing');
      });
  }

  document.addEventListener('click', function (e) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = closestLink(e.target);
    if (!link) return;
    if (link.hasAttribute('download')) return;
    if (link.target && link.target !== '_self') return;
    var href = link.href;
    if (!href || href.indexOf(location.origin) !== 0) return;
    if (href.indexOf('mailto:') === 0 || href.indexOf('javascript:') === 0) return;
    var next = href.split('#')[0];
    var now = location.href.split('#')[0];
    if (next === now) return;
    if (shouldHardNav(next)) return;
    e.preventDefault();
    e.stopPropagation();
    go(next, true);
  }, true);

  window.addEventListener('popstate', function () {
    if (shouldHardNav(location.href)) {
      location.reload();
      return;
    }
    go(location.href, false);
  });
})();
