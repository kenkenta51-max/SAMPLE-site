/* Pricing data is a fictional design sample, not a live service offer. */
const pricingPlans = Object.freeze({
  body: { name: '全身医療脱毛', short: '全身5回', total: 79800, sessions: 5, excludes: '顔・VIOを除く' },
  vio: { name: '全身＋VIO 医療脱毛', short: '全身＋VIO 5回', total: 109800, sessions: 5, excludes: '顔を除く' },
  full: { name: '全身＋顔＋VIO 医療脱毛', short: '全身＋顔＋VIO 5回', total: 139800, sessions: 5, excludes: '顔・VIOも含む' }
});
const priceFormat = new Intl.NumberFormat('ja-JP');
function selectedPricingPlan() {
  const choice = document.querySelector('input[name="pricing-plan"]:checked');
  return pricingPlans[choice?.value] || pricingPlans.body;
}
function updatePricingPlan() {
  const plan = selectedPricingPlan();
  document.querySelector('#selected-plan-name').textContent = plan.name;
  document.querySelector('#selected-plan-exclusion').textContent = plan.excludes;
  document.querySelector('#selected-plan-total').textContent = priceFormat.format(plan.total);
  const unit = document.querySelector('#selected-plan-unit');
  unit.replaceChildren(document.createTextNode(priceFormat.format(plan.total / plan.sessions)));
  const yen = document.createElement('span');
  yen.textContent = '円';
  unit.append(yen);
  document.querySelector('#plan-selection-status').textContent = '選択中：' + plan.short + '・税込総額' + priceFormat.format(plan.total) + '円';
}
document.querySelectorAll('input[name="pricing-plan"]').forEach(input => input.addEventListener('change', updatePricingPlan));
updatePricingPlan();
