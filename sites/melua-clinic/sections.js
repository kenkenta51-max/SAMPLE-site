'use strict';
const comparison = document.querySelector('.comparison');
const skinRange = document.querySelector('#skin-range');
function updateSkinComparison() {
  const value = Math.min(100, Math.max(0, Number(skinRange.value)));
  comparison.style.setProperty('--split', value + '%');
  skinRange.setAttribute('aria-valuetext', '処理していない状態を' + value + 'パーセント表示');
}
if (comparison && skinRange) {
  skinRange.addEventListener('input', updateSkinComparison);
  updateSkinComparison();
}
const infoDialog = document.querySelector('#info-dialog');
let infoOpener;
const demoInfo = {
  clinic: ['クリニック情報', 'メルアクリニックは、デザイン確認用の架空のクリニックです。実在する医療機関・所在地・診療時間の情報は掲載していません。'],
  privacy: ['プライバシーポリシー', 'こちらは架空のクリニックのデモサイトです。予約フォームは未接続で、このページからお名前や連絡先などの個人情報を入力・送信する機能はありません。']
};
document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => {
  const info = demoInfo[button.dataset.info];
  if (!info) return;
  infoOpener = button;
  document.querySelector('#info-title').textContent = info[0];
  document.querySelector('#info-copy').textContent = info[1];
  infoDialog.showModal();
}));
document.querySelector('#info-close').addEventListener('click', () => infoDialog.close());
infoDialog.addEventListener('close', () => infoOpener?.focus());
