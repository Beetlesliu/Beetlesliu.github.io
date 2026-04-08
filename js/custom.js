// 阅读进度条
(function () {
  // 仅在文章页生效
  if (!document.querySelector('.post-content')) return;

  var bar = document.createElement('div');
  bar.id = 'reading-progress';
  document.body.appendChild(bar);

  window.addEventListener('scroll', function () {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = Math.min(progress, 100) + '%';
  });
})();

// 外部链接自动新窗口打开
(function () {
  var content = document.querySelector('.post-content');
  if (!content) return;

  var links = content.querySelectorAll('a[href^="http"]');
  var host = window.location.host;
  for (var i = 0; i < links.length; i++) {
    if (links[i].hostname !== host) {
      links[i].setAttribute('target', '_blank');
      links[i].setAttribute('rel', 'noopener noreferrer');
    }
  }
})();
