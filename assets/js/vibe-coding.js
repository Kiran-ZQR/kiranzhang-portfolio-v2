(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-height: 540px)');
  const animated = () => !reduced.matches && !compact.matches;
  const conversation = document.querySelector('.vibe-conversation');
  const stage = document.querySelector('.conversation-stage');
  const scenes = [...document.querySelectorAll('.conversation-scene')];
  const dots = [...document.querySelectorAll('.conversation-dots span')];
  const previous = document.querySelector('[data-chat-prev]');
  const next = document.querySelector('[data-chat-next]');
  const announcement = document.querySelector('.conversation-announcement');
  const progress = document.querySelector('.vibe-progress i');
  let frame = 0, current = -1, currentAnswer = false;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function renderConversation() {
    if (!conversation || !animated()) return;
    const bounds = conversation.getBoundingClientRect();
    const distance = Math.max(1, conversation.offsetHeight - stage.offsetHeight);
    const position = clamp(-bounds.top / distance, 0, 1);
    const beat = Math.min(7, Math.floor(position * 8));
    const index = Math.floor(beat / 2), hasAnswer = beat % 2 === 1;
    if (index === current && hasAnswer === currentAnswer) return;
    current = index; currentAnswer = hasAnswer;
    scenes.forEach((scene, i) => {
      scene.classList.toggle('is-current', i === index);
      scene.classList.toggle('has-answer', i === index && hasAnswer);
      scene.inert = i !== index;
      scene.setAttribute('aria-hidden', String(i !== index));
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-current', i === index));
    previous.disabled = beat === 0;
    next.setAttribute('aria-label', beat === 7 ? '继续阅读案例正文' : '下一条对话');
    announcement.textContent = `第 ${index + 1} 段，共 ${scenes.length} 段。${hasAnswer ? '回答已显示' : scenes[index].querySelector('.question,.prompt').textContent}`;
  }
  function update() {
    frame = 0;
    const total = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${total > 0 ? clamp(scrollY / total, 0, 1) : 0})`;
    renderConversation();
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function go(delta) {
    if (!animated()) return;
    const top = conversation.getBoundingClientRect().top + scrollY;
    const distance = conversation.offsetHeight - stage.offsetHeight;
    const beat = Math.max(0, current * 2 + Number(currentAnswer));
    const target = clamp(beat + delta, 0, 8);
    // Land inside a beat, away from rounding boundaries. Last step exits the pinned scene.
    scrollTo({top: target === 8 ? top + conversation.offsetHeight : top + distance * (target + .25) / 8, behavior:'smooth'});
  }
  previous?.addEventListener('click', () => go(-1));
  next?.addEventListener('click', () => go(1));
  stage?.addEventListener('keydown', event => {
    if (event.target !== stage || !animated()) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault();go(event.key === 'ArrowRight' ? 1 : -1);}
  });
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
  }), {threshold:.08, rootMargin:'0px 0px -25px 0px'});
  function configure() {
    document.documentElement.classList.toggle('js-motion', animated());
    current = -1;
    if (!animated()) scenes.forEach(scene => {scene.inert=false;scene.removeAttribute('aria-hidden');});
    schedule();
  }
  // Without JavaScript or with reduced motion, every exchange remains ordinary readable content.
  document.querySelectorAll('.vibe-reveal').forEach(element => observer.observe(element));
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  reduced.addEventListener('change', configure);
  compact.addEventListener('change', configure);
  configure();
})();
