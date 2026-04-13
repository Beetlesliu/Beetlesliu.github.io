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
      'background:rgba(41,128,185,0.95);color:#fff;padding:10px 20px;border-radius:24px;' +
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

  // --- 初始化 ---
  function init() {
    initReadingProgress();
    initExternalLinks();
    initSmoothAnchorScroll();
    initScrollFadeIn();
    initCopyToast();
    initImageFade();
    initIndexGrid();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
