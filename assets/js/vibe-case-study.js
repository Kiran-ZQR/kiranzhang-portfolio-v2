(() => {
  'use strict';
  const form = document.querySelector('#fuel-demo');
  if (!form) return;
  const fields = [
    {input: form.elements.namedItem('distance'), error: document.querySelector('#fuel-distance-error'), empty: '请输入本次行驶里程', invalid: '行驶里程需为大于 0 的有效数字'},
    {input: form.elements.namedItem('volume'), error: document.querySelector('#fuel-volume-error'), empty: '请输入区间耗油量', invalid: '区间耗油量需为大于 0 的有效数字'}
  ];
  const result = form.querySelector('[data-fuel-result]');
  const output = form.querySelector('#fuel-output');
  const status = form.querySelector('[data-fuel-status]');
  const formula = form.querySelector('[data-fuel-formula]');
  const basis = form.querySelector('[data-fuel-basis]');
  const announcement = form.querySelector('[data-fuel-announcement]');
  const number = value => value.toLocaleString('zh-CN', {maximumFractionDigits: 6});
  function clearError(field) {
    field.error.textContent = '';
    field.input.removeAttribute('aria-invalid');
  }
  function pending() {
    result.classList.remove('is-updated');
    result.classList.add('is-stale');
    output.value = '—';
    status.textContent = '待重新计算';
    formula.textContent = '输入已修改，点击计算更新结果';
    basis.textContent = '结果将对应当前填写的里程与耗油量';
    announcement.textContent = '';
  }
  function calculate(event) {
    event?.preventDefault();
    let firstInvalid = null;
    fields.forEach(field => {
      const raw = field.input.value.trim();
      const value = field.input.valueAsNumber;
      const message = !raw && !field.input.validity.badInput
        ? field.empty : !Number.isFinite(value) || value <= 0 ? field.invalid : '';
      clearError(field);
      if (message) {
        field.error.textContent = message;
        field.input.setAttribute('aria-invalid', 'true');
        firstInvalid ??= field.input;
      }
    });
    if (firstInvalid) {
      pending();
      status.textContent = '请核对输入';
      announcement.textContent = '请核对输入，' + fields.filter(field => field.error.textContent).map(field => field.error.textContent).join('；');
      firstInvalid.focus();
      return;
    }
    const distance = fields[0].input.valueAsNumber;
    const volume = fields[1].input.valueAsNumber;
    const consumption = volume / distance * 100;
    if (!Number.isFinite(consumption) || consumption <= 0) {
      pending();
      fields[0].error.textContent = '这组数值无法计算，请核对里程与耗油量';
      fields[0].input.setAttribute('aria-invalid', 'true');
      status.textContent = '请核对输入';
      announcement.textContent = fields[0].error.textContent;
      fields[0].input.focus();
      return;
    }
    const formatted = consumption.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    output.value = formatted;
    status.textContent = '已按当前输入计算';
    formula.textContent = number(volume) + ' ÷ ' + number(distance) + ' × 100 = ' + formatted;
    basis.textContent = '对应行驶 ' + number(distance) + ' 公里、耗油 ' + number(volume) + ' 升';
    result.classList.remove('is-stale', 'is-updated');
    void result.offsetWidth;
    result.classList.add('is-updated');
    announcement.textContent = '计算完成，估算油耗为每百公里 ' + formatted + ' 升。' + basis.textContent;
  }
  fields.forEach(field => field.input.addEventListener('input', () => { clearError(field); pending(); }));
  form.addEventListener('submit', calculate);
  form.querySelector('[data-fuel-example]').addEventListener('click', () => {
    fields[0].input.value = '420';
    fields[1].input.value = '31.5';
    fields.forEach(clearError);
    calculate();
    status.textContent = '示例结果';
  });
})();

