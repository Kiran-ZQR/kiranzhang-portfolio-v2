(() => {
  'use strict';
  const dialog = document.querySelector('#cm-dialog');
  if (!dialog) return;
  const detail = document.querySelector('#cm-detail');
  const title = document.querySelector('#cm-dialog-title');
  const close = document.querySelector('#cm-close');
  let trigger = null;
  let previousOverflow = '';
  document.querySelectorAll('[data-cm-image]').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      title.textContent = button.dataset.cmTitle;
      detail.alt = button.dataset.cmTitle + '完整交付稿';
      detail.src = button.dataset.cmImage;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      dialog.scrollTop = 0;
      close.focus();
    });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    trigger?.focus({preventScroll: true});
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
})();

