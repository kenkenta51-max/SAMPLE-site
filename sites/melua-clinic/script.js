'use strict';
const main = document.querySelector('#lp');
const menu = document.querySelector('.fv-menu');
const dialog = document.querySelector('#booking-dialog');
const motionButton = document.querySelector('#motion-toggle');
const light = document.querySelector('.skin-light');
if (light) light.src = document.querySelector('.photo > img').src;
let opener = null;
function openBooking(event) {
  event.preventDefault();
  opener = event.currentTarget;
  const summary = document.querySelector('#booking-plan-summary');
  const consultPlan = opener.hasAttribute('data-consult-plan');
  if (summary) {
    summary.hidden = !consultPlan;
    if (consultPlan) {
      const plan = selectedPricingPlan();
      summary.textContent = 'ご相談のプラン：' + plan.short + '／税込総額' + priceFormat.format(plan.total) + '円（サンプル料金）';
    }
  }
  menu.open = false;
  if (!dialog.open) dialog.showModal();
}
document.querySelector('#reserve').addEventListener('click', openBooking);
document.querySelectorAll('[data-reserve]').forEach(link => link.addEventListener('click', openBooking));
document.querySelector('#close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  if (opener?.closest('.fv-menu')) document.querySelector('.fv-menu summary').focus();
  else opener?.focus();
});
menu.querySelectorAll('a:not([data-reserve])').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
document.addEventListener('keydown', event => { if (event.key === 'Escape') menu.open = false; });
document.addEventListener('pointerdown', event => { if (!menu.contains(event.target)) menu.open = false; });
motionButton.addEventListener('click', () => {
  const paused = main.classList.toggle('paused');
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? '動きを再開する' : '動きを止める';
});
document.addEventListener('visibilitychange', () => main.classList.toggle('document-hidden', document.hidden));
