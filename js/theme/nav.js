/**
 * 试验性无感跳转（可整笔撤销）
 * 壳留下，只换 #content。ZONE 没有这套壳，仍整页走。
 */
(function () {
  var TWI_ENV = 'https://twikoo.yaoyuan.vip/.netlify/functions/twikoo';
  var scripts = {};

  function pathOf(href) {
    try {
      return new URL(href, location.href).pathname;
    } catch (e) {
      return '';
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

  function loadScript(src) {
    src = src.replace(/\\/g, '/');
    if (scripts[src]) return scripts[src];
    scripts[src] = new Promise(function (resolve, reject) {
      if (src.indexOf('clipboard') !== -1 && window.ClipboardJS) {
        resolve();
        return;
      }
      if (src.indexOf('twikoo') !== -1 && window.twikoo) {
        resolve();
        return;
      }
      var el = document.createElement('script');
      el.src = src;
      el.onload = function () { resolve(); };
      el.onerror = reject;
      document.body.appendChild(el);
    });
    return scripts[src];
  }

  function applyPageCss(root) {
    document.querySelectorAll('link[data-pjax-css]').forEach(function (node) {
      node.remove();
    });
    root.querySelectorAll('link[rel="stylesheet"]').forEach(function (link) {
      var el = document.createElement('link');
      el.rel = 'stylesheet';
      el.href = link.getAttribute('href');
      el.setAttribute('data-pjax-css', '1');
      document.head.appendChild(el);
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
    var setting = window.imageLazyLoadSetting;
    if (setting && typeof setting.processImages === 'function') {
      setting.processImages(true);
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
      return;
    }
    applyPageCss(next);
    cur.innerHTML = next.innerHTML;
    document.title = doc.title || document.title;
    if (doc.body && doc.body.className != null) {
      document.body.className = doc.body.className;
    }
    if (push) history.pushState({ yyPjax: 1 }, '', url);
    window.scrollTo(0, 0);
    afterSwap();
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
        swap(html, url, push);
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
