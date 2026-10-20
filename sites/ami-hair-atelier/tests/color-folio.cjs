const {JSDOM}=require('jsdom');const fs=require('fs'),assert=require('node:assert/strict');
function setup(reduced){
 const w=new JSDOM(fs.readFileSync(require('node:path').join(__dirname,'..','dist','index.html'),'utf8'),{runScripts:'outside-only',url:'https://example.test'}).window;
 w.matchMedia=()=>({matches:reduced});w.HTMLElement.prototype.scrollBy=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
 let animated=0,cancelled=0;
 w.HTMLElement.prototype.animate=function(){animated++;return {};};w.HTMLElement.prototype.getAnimations=function(){return [{cancel(){cancelled++;}}];};
 w.eval(fs.readFileSync(require('node:path').join(__dirname,'..','dist','app.js'),'utf8'));
 const $=s=>w.document.querySelector(s),click=s=>$(s).click();
 assert.equal($('.diagnosis-title').textContent,'ヘアカラー診断');assert.equal(w.document.querySelectorAll('.color-print [role="img"]').length,3);
 assert.equal(w.document.querySelectorAll('.menu-thumb').length,4);
 click('[data-menu="2"]');assert.equal($('#selection-visual').dataset.menu,'2');assert.equal($('.selection-visual-label').textContent,'CUT + PERM');assert.equal($('#total-price').textContent,'¥13,200');
 assert.equal($('[data-menu="2"]').getAttribute('aria-checked'),'true');assert.equal(w.document.activeElement.dataset.menu,'2');
 assert.equal(animated,reduced?0:1);assert.equal(cancelled,reduced?0:1);
 $('[data-menu="2"]').dispatchEvent(new w.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));
 assert.equal($('#selection-visual').dataset.menu,'3');assert.equal(w.document.activeElement.dataset.menu,'3');assert.equal($('#total-price').textContent,'¥11,000');
 click('#menu-book');$('#booking-menu').value='1';$('#booking-menu').dispatchEvent(new w.Event('change'));
 assert.equal($('#selection-visual').dataset.menu,'1');assert.equal($('.selection-visual-label').textContent,'DESIGN CUT');assert.ok($('#booking-summary').textContent.includes('¥5,500'));
 console.log('PASS: diagnosis label/photos, menu photo/price synchronization, keyboard selection and '+(reduced?'reduced-motion':'animated transition')+'.');w.close();
}
setup(false);setup(true);
