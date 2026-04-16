// =============================
// Beetles' Blog Custom Scripts
// =============================

(function () {
  'use strict';

  // --- 阅读进度条 ---
  function initReadingProgress() {
    if (!document.querySelector('.post-content')) return;

    var bar = document.createElement('div');
    bar.id = 'reading-progress';
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = Math.min(progress, 100) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  // --- 外部链接自动新窗口 ---
  function initExternalLinks() {
    var content = document.querySelector('.post-content');
    if (!content) return;
    var host = window.location.host;
    var links = content.querySelectorAll('a[href^="http"]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].hostname !== host) {
        links[i].setAttribute('target', '_blank');
        links[i].setAttribute('rel', 'noopener noreferrer');
      }
    }
  }

  // --- 锚点平滑滚动（带导航栏偏移）---
  function initSmoothAnchorScroll() {
    var navbar = document.querySelector('.navbar');
    var offset = navbar ? navbar.offsetHeight + 20 : 80;

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (href === '#' || href.length < 2) return;

      var target;
      try {
        target = document.querySelector(href);
      } catch (err) {
        return;
      }
      if (!target) return;

      e.preventDefault();
      var rect = target.getBoundingClientRect();
      var top = rect.top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });

      // 更新 URL hash 但不触发跳转
      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  }

  // --- 滚动淡入动画 ---
  function initScrollFadeIn() {
    if (!('IntersectionObserver' in window)) return;

    var targets = document.querySelectorAll('.index-card');
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.classList.add('fade-in-scroll');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  // --- 代码块复制提示 ---
  function initCopyToast() {
    var copyBtns = document.querySelectorAll('.copy-btn');
    if (!copyBtns.length) return;

    copyBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        showToast('已复制到剪贴板');
      });
    });
  }

  function showToast(msg) {
    var toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText =
      'position:fixed;left:50%;bottom:40px;transform:translateX(-50%) translateY(20px);' +
      'background:rgba(31,41,55,0.95);color:#fff;padding:10px 20px;border-radius:8px;' +
      'font-size:14px;z-index:10000;box-shadow:0 4px 16px rgba(0,0,0,0.2);' +
      'opacity:0;transition:all 0.3s ease;pointer-events:none;';
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(function () { toast.remove(); }, 300);
    }, 1800);
  }

  // --- 图片淡入加载 ---
  function initImageFade() {
    var imgs = document.querySelectorAll('.post-content img');
    imgs.forEach(function (img) {
      if (img.complete) return;
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.5s ease';
      img.addEventListener('load', function () {
        img.style.opacity = '1';
      }, { once: true });
    });
  }

  // --- 首页卡片包裹为网格 ---
  function initIndexGrid() {
    var cards = document.querySelectorAll('.index-card');
    if (cards.length < 2) return;

    var parent = cards[0].parentElement;
    // 检查是否所有卡片都在同一个父元素下
    for (var i = 1; i < cards.length; i++) {
      if (cards[i].parentElement !== parent) return;
    }

    var grid = document.createElement('div');
    grid.className = 'index-cards-grid';
    parent.insertBefore(grid, cards[0]);
    cards.forEach(function (card) { grid.appendChild(card); });
  }

  // --- 命令面板（⌘K / Ctrl-K）---
  // 数据来源：Hexo 的 /local-search.xml（hexo-generator-search 生成）
  var paletteState = {
    loaded: false,
    loading: false,
    items: [],
    overlay: null,
    input: null,
    list: null,
    active: 0
  };

  function ensurePalette() {
    if (paletteState.overlay) return paletteState.overlay;

    var overlay = document.createElement('div');
    overlay.className = 'cmdk-overlay';
    overlay.innerHTML =
      '<div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="命令面板">' +
      '  <div class="cmdk-head">' +
      '    <span class="cmdk-prompt">›</span>' +
      '    <input type="text" class="cmdk-input" placeholder="搜索文章、分类、页面…" autocomplete="off" spellcheck="false">' +
      '    <kbd class="cmdk-hint">esc</kbd>' +
      '  </div>' +
      '  <div class="cmdk-list" role="listbox"></div>' +
      '  <div class="cmdk-foot">' +
      '    <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>' +
      '    <span><kbd>enter</kbd> 打开</span>' +
      '    <span><kbd>esc</kbd> 关闭</span>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);

    paletteState.overlay = overlay;
    paletteState.input = overlay.querySelector('.cmdk-input');
    paletteState.list = overlay.querySelector('.cmdk-list');

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePalette();
    });

    paletteState.input.addEventListener('input', renderPalette);
    paletteState.input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        movePaletteActive(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        movePaletteActive(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        openPaletteActive();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      }
    });

    return overlay;
  }

  function openPalette() {
    var overlay = ensurePalette();
    overlay.classList.add('is-open');
    document.body.classList.add('cmdk-lock');
    paletteState.input.value = '';
    paletteState.active = 0;
    loadPaletteData(function () { renderPalette(); });
    setTimeout(function () { paletteState.input.focus(); }, 30);
  }

  function closePalette() {
    if (!paletteState.overlay) return;
    paletteState.overlay.classList.remove('is-open');
    document.body.classList.remove('cmdk-lock');
  }

  function loadPaletteData(cb) {
    if (paletteState.loaded) { cb && cb(); return; }
    if (paletteState.loading) return;
    paletteState.loading = true;

    var root = (window.CONFIG && window.CONFIG.root) || '/';
    fetch(root.replace(/\/+$/, '/') + 'local-search.xml')
      .then(function (r) { return r.text(); })
      .then(function (xml) {
        var doc = new DOMParser().parseFromString(xml, 'application/xml');
        var entries = doc.querySelectorAll('entry');
        var items = [];
        entries.forEach(function (e) {
          var title = (e.querySelector('title') || {}).textContent || '';
          var url = (e.querySelector('url') || {}).textContent || '';
          var categories = e.querySelector('categories') || null;
          var cat = '';
          if (categories) {
            var c = categories.querySelector('category');
            cat = c ? c.textContent : '';
          }
          if (title && url) items.push({ title: title.trim(), url: url.trim(), cat: cat.trim(), type: 'post' });
        });
        // 静态导航项（从 navbar 抓取）
        var navLinks = document.querySelectorAll('.navbar .nav-link[href]');
        navLinks.forEach(function (a) {
          var href = a.getAttribute('href');
          var text = (a.textContent || '').trim();
          if (!href || href === '#' || !text) return;
          items.push({ title: text, url: href, cat: '导航', type: 'nav' });
        });

        paletteState.items = items;
        paletteState.loaded = true;
        paletteState.loading = false;
        cb && cb();
      })
      .catch(function () {
        paletteState.loading = false;
        paletteState.list.innerHTML =
          '<div class="cmdk-empty">搜索索引加载失败</div>';
      });
  }

  function fuzzyScore(text, q) {
    if (!q) return 1;
    text = text.toLowerCase();
    q = q.toLowerCase();
    if (text.indexOf(q) !== -1) return 10 - (text.indexOf(q) * 0.01);
    // 宽松字符匹配
    var ti = 0, qi = 0;
    while (ti < text.length && qi < q.length) {
      if (text[ti] === q[qi]) qi++;
      ti++;
    }
    return qi === q.length ? 1 : 0;
  }

  function renderPalette() {
    if (!paletteState.list) return;
    var q = paletteState.input.value.trim();
    var scored = paletteState.items
      .map(function (it) {
        var s = Math.max(fuzzyScore(it.title, q), fuzzyScore(it.cat, q) * 0.7);
        return { it: it, score: s };
      })
      .filter(function (x) { return q === '' || x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 12);

    paletteState.active = 0;

    if (!scored.length) {
      paletteState.list.innerHTML = '<div class="cmdk-empty">无匹配结果</div>';
      return;
    }

    paletteState.list.innerHTML = scored.map(function (x, i) {
      var typeIcon = x.it.type === 'nav' ? '⎋' : '›';
      var cat = x.it.cat ? '<span class="cmdk-cat">' + escapeText(x.it.cat) + '</span>' : '';
      return '<a class="cmdk-item' + (i === 0 ? ' is-active' : '') +
        '" href="' + x.it.url + '" data-idx="' + i + '">' +
        '<span class="cmdk-arrow">' + typeIcon + '</span>' +
        '<span class="cmdk-title">' + highlight(x.it.title, q) + '</span>' +
        cat +
        '</a>';
    }).join('');

    paletteState.list.querySelectorAll('.cmdk-item').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        paletteState.active = parseInt(el.dataset.idx, 10);
        updatePaletteActive();
      });
    });
  }

  function escapeText(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function highlight(text, q) {
    var safe = escapeText(text);
    if (!q) return safe;
    var idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return safe;
    var before = escapeText(text.slice(0, idx));
    var match = escapeText(text.slice(idx, idx + q.length));
    var after = escapeText(text.slice(idx + q.length));
    return before + '<mark>' + match + '</mark>' + after;
  }

  function movePaletteActive(delta) {
    var items = paletteState.list.querySelectorAll('.cmdk-item');
    if (!items.length) return;
    paletteState.active = (paletteState.active + delta + items.length) % items.length;
    updatePaletteActive();
  }

  function updatePaletteActive() {
    var items = paletteState.list.querySelectorAll('.cmdk-item');
    items.forEach(function (el, i) {
      el.classList.toggle('is-active', i === paletteState.active);
      if (i === paletteState.active) {
        el.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function openPaletteActive() {
    var items = paletteState.list.querySelectorAll('.cmdk-item');
    if (!items.length) return;
    var a = items[paletteState.active];
    if (a) window.location.href = a.getAttribute('href');
  }

  function initCommandPalette() {
    document.addEventListener('keydown', function (e) {
      // Ctrl-K / ⌘K 打开
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        openPalette();
        return;
      }
      // "/" 打开（非输入框中）
      if (e.key === '/' && document.activeElement && document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA' && !document.activeElement.isContentEditable) {
        e.preventDefault();
        openPalette();
      }
    });
  }

  // --- 初始化 ---
  function init() {
    initReadingProgress();
    initExternalLinks();
    initSmoothAnchorScroll();
    initScrollFadeIn();
    initCopyToast();
    initImageFade();
    initIndexGrid();
    initCommandPalette();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
