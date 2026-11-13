(() => {
  'use strict';
  // English is temporarily unpublished. The full implementation remains local.
  try { localStorage.setItem('portfolio-language', 'zh'); } catch {}
  document.documentElement.lang = 'zh-CN';
  window.PortfolioI18n = Object.freeze({
    lang: 'zh',
    t: value => value,
    translate: root => root,
    casePages: ["tencent-news-details.html", "tencent-news-refresh.html", "tencent-news-guide.html", "tencent-news-live.html", "tencent-news-promotion.html", "tencent-news-comments.html", "tencent-news-daynight.html", "tencent-news-ai-briefing.html", "tencent-news-crop.html", "tencent-news-ai-tools.html", "academic-sadra.html", "academic-fursure.html", "academic-profiled.html", "academic-star-farm.html", "academic-lead-me.html", "sentaiment.html"]
  });
  const url = new URL(location.href);
  const file = url.pathname.split('/').pop();
  if (/\/en\/[^/]+$/.test(url.pathname) && window.PortfolioI18n.casePages.includes(file)) {
    url.pathname = url.pathname.replace(/\/en\/([^/]+)$/, '/$1');
    url.searchParams.delete('lang');
    location.replace(url.href);
    return;
  }
  if (url.searchParams.has('lang')) {
    url.searchParams.delete('lang');
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  }
})();

