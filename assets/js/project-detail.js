const tabs = [...document.querySelectorAll('[data-case]')];
const panels = [...document.querySelectorAll('[data-panel]')];
const switcher = document.querySelector('.case-switcher');
const progress = document.querySelector('.reading-progress i');
const diagnosis = document.querySelector('.diagnosis-sequence');

// Glass is styled once on the actual navigation controls by assets/css/project-glass.css.

// Shared navigation CSS supplies local glass surfaces; avoid a full-width SVG filter.

document.querySelectorAll('.typewriter-title').forEach((title) => {
  const textNodes = [];
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (walker.currentNode.parentElement?.classList.contains('type-caret')) continue;
    textNodes.push(walker.currentNode);
  }
  let typeIndex = 0;
  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    Array.from(node.textContent).forEach((char) => {
      if (/\s/.test(char)) {
        fragment.append(char);
        return;
      }
      const span = document.createElement('span');
      span.className = 'type-char';
      span.textContent = char;
      span.style.setProperty('--type-index', typeIndex++);
      fragment.append(span);
    });
    node.replaceWith(fragment);
  });
});

function startCountUp(scope) {
  scope.querySelectorAll('[data-count-up]:not([data-counted])').forEach((counter) => {
    counter.dataset.counted = 'true';
    const target = Number(counter.dataset.countUp) || 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      counter.textContent = String(target);
      return;
    }
    const duration = 1450;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

document.querySelectorAll('.story-heading h2').forEach((title) => {
  const textNodes = [];
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  let charIndex = 0;
  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    Array.from(node.textContent).forEach((char) => {
      if (/\s/.test(char)) {
        fragment.append(char);
        return;
      }
      const span = document.createElement('span');
      span.className = 'story-char';
      span.textContent = char;
      span.style.setProperty('--char-index', charIndex++);
      fragment.append(span);
    });
    node.replaceWith(fragment);
  });
});

document.querySelectorAll('.footer-home>span,.footer-bottom>a').forEach((element) => {
  const text = element.textContent;
  element.textContent = '';
  Array.from(text).forEach((char) => {
    if (/\s/.test(char)) {
      const space = document.createElement('span');
      space.className = 'footer-select-space';
      space.textContent = char;
      element.append(space);
      return;
    }
    const letter = document.createElement('span');
    letter.className = 'footer-select-char';
    letter.textContent = char;
    element.append(letter);
  });
});

function observeReveals(scope = document) {
  const items = scope.querySelectorAll('.reveal:not([data-observed]),.detail-reveal:not([data-observed])');
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      startCountUp(entry.target);
      instance.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  items.forEach((item, index) => {
    item.dataset.observed = 'true';
    item.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
    observer.observe(item);
  });
}

function setCase(name, updateHash = true) {
  const next = panels.find((panel) => panel.dataset.panel === name) || panels[0];
  panels.forEach((panel) => {
    const active = panel === next;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
  tabs.forEach((tab) => {
    const active = tab.dataset.case === next.dataset.panel;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  switcher.dataset.active = next.dataset.panel;
  if (updateHash) {
    history.replaceState(null, '', `#${next.dataset.panel}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  requestAnimationFrame(() => observeReveals(next));
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    setCase(tab.dataset.case);
  });
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(index + direction + tabs.length) % tabs.length];
    next.focus();
    setCase(next.dataset.case);
  });
});

document.querySelectorAll('[data-case-jump]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    setCase(link.dataset.caseJump);
  });
});

let scrollFrame = 0;
function updateScrollEffects() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  document.querySelectorAll('.detail-reveal.is-visible').forEach((section) => {
    const rect = section.getBoundingClientRect();
    const scene = Math.max(-1, Math.min(1, (innerHeight * .5 - (rect.top + rect.height * .5)) / innerHeight));
    section.querySelectorAll('.story-piece').forEach((piece, index) => {
      const direction = index % 2 === 0 ? -1 : 1;
      piece.style.setProperty('--piece-y', `${(scene * direction * 9).toFixed(2)}px`);
    });
  });
}
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    updateScrollEffects();
  });
}, { passive: true });
window.addEventListener('resize', updateScrollEffects, { passive: true });

if (diagnosis) {
  diagnosis.addEventListener('pointermove', (event) => {
    const bounds = diagnosis.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    diagnosis.style.setProperty('--pointer-x', `${x.toFixed(2)}%`);
    diagnosis.style.setProperty('--pointer-y', `${y.toFixed(2)}%`);
  }, { passive: true });
}

const initialHash = location.hash.slice(1);
setCase(initialHash === 'explore' ? 'explore' : 'business', false);
if (initialHash && initialHash !== 'business' && initialHash !== 'explore') {
  requestAnimationFrame(() => document.getElementById(initialHash)?.scrollIntoView());
}
updateScrollEffects();
