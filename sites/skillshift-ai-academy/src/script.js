document.documentElement.classList.add('js');

const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');

function closeMenu() {
  if (!menuToggle || !nav) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.querySelector('.sr-only').textContent = 'メニューを開く';
  nav.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    menuToggle.querySelector('.sr-only').textContent = willOpen ? 'メニューを閉じる' : 'メニューを開く';
    nav.classList.toggle('is-open', willOpen);
    document.body.classList.toggle('menu-open', willOpen);
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 840) closeMenu();
  });
}

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const caseTabs = Array.from(document.querySelectorAll('[role="tab"][aria-controls^="case-panel-"]'));
const casePanels = Array.from(document.querySelectorAll('.case-story[role="tabpanel"]'));

function selectCase(nextTab, moveFocus = false) {
  caseTabs.forEach((tab) => {
    const selected = tab === nextTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  casePanels.forEach((panel) => {
    panel.hidden = panel.id !== nextTab.getAttribute('aria-controls');
  });

  if (moveFocus) nextTab.focus();
}

if (caseTabs.length && casePanels.length) {
  document.querySelector('.cases')?.classList.add('cases-enhanced');
  selectCase(caseTabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || caseTabs[0]);

  caseTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCase(tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % caseTabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + caseTabs.length) % caseTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = caseTabs.length - 1;
      if (nextIndex !== index) {
        event.preventDefault();
        selectCase(caseTabs[nextIndex], true);
      }
    });
  });
}

const briefingForm = document.querySelector('[data-briefing-form]');

if (briefingForm) {
  const formStatus = briefingForm.querySelector('[data-form-status]');
  const submitButton = briefingForm.querySelector('button[type="submit"]');
  const rules = {
    name: (field) => field.value.trim() ? '' : '氏名を入力してください。',
    email: (field) => {
      if (!field.value.trim()) return 'メールアドレスを入力してください。';
      return field.validity.typeMismatch ? 'メールアドレスを正しい形式で入力してください。' : '';
    },
    phone: (field) => !field.value.trim() || /^[0-9+()\-\s]{8,20}$/.test(field.value.trim()) ? '' : '電話番号は数字・ハイフンなどで入力してください。',
    schedule: (field) => field.value ? '' : '希望参加日時を選択してください。',
    'privacy-consent': (field) => field.checked ? '' : '個人情報保護方針（仮表示）への同意が必要です。'
  };

  function showFieldError(field, message) {
    const errorId = field.name === 'privacy-consent' ? 'privacy-error' : `${field.id}-error`;
    const error = document.getElementById(errorId);
    if (error) error.textContent = message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
  }

  function validateField(field) {
    const rule = rules[field.name];
    const message = rule ? rule(field) : '';
    showFieldError(field, message);
    return !message;
  }

  Object.keys(rules).forEach((name) => {
    const field = briefingForm.elements.namedItem(name);
    field?.addEventListener(field.type === 'checkbox' ? 'change' : 'blur', () => validateField(field));
    field?.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  briefingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (submitButton.disabled) return;
    submitButton.disabled = true;
    submitButton.setAttribute('aria-disabled', 'true');
    formStatus.textContent = '';

    const invalidFields = Object.keys(rules)
      .map((name) => briefingForm.elements.namedItem(name))
      .filter((field) => field && !validateField(field));

    if (invalidFields.length) {
      formStatus.textContent = '入力内容を確認してください。送信は行われていません。';
      invalidFields[0].focus();
    } else {
      formStatus.textContent = '入力チェックは完了しましたが、送信先が未設定のため送信していません。このデモでは入力内容を保存しません。';
    }

    window.setTimeout(() => {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-disabled');
    }, 400);
  });
}

const infoDialog = document.querySelector('[data-info-dialog-modal]');
const dialogTitle = infoDialog?.querySelector('[data-dialog-title]');
const dialogContent = infoDialog?.querySelector('[data-dialog-content]');
let dialogOpener = null;
const dialogTitles = {
  company: '会社情報',
  commerce: '特定商取引法に基づく表記',
  privacy: '個人情報保護方針',
  contact: 'お問い合わせ'
};

if (infoDialog && dialogTitle && dialogContent) {
  document.querySelectorAll('[data-info-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.infoDialog;
      const template = document.getElementById(`info-${key}`);
      if (!template) return;
      dialogOpener = button;
      dialogTitle.textContent = dialogTitles[key] || '仮表示';
      dialogContent.replaceChildren(template.content.cloneNode(true));
      infoDialog.showModal();
      infoDialog.querySelector('[data-dialog-close]')?.focus();
    });
  });

  infoDialog.querySelectorAll('[data-dialog-close]').forEach((button) => {
    button.addEventListener('click', () => infoDialog.close());
  });

  infoDialog.addEventListener('click', (event) => {
    if (event.target === infoDialog) infoDialog.close();
  });

  infoDialog.addEventListener('close', () => dialogOpener?.focus());

  infoDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      infoDialog.close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(infoDialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((element) => !element.disabled && element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

const mobileCta = document.querySelector('[data-mobile-cta]');

if (mobileCta) {
  mobileCta.hidden = false;
  const exclusionSections = Array.from(document.querySelectorAll('#faq, #briefing, #final-cta, #footer'));
  const visibleExclusions = new Set();
  let frameRequested = false;

  function updateMobileCta() {
    frameRequested = false;
    const compact = window.matchMedia('(max-width: 700px)').matches;
    const isTyping = Boolean(document.activeElement?.closest('#briefing-form'));
    const pastIntroduction = window.scrollY > Math.min(1200, window.innerHeight * 1.25);
    mobileCta.classList.toggle('is-visible', compact && pastIntroduction && !visibleExclusions.size && !isTyping);
  }

  function requestCtaUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateMobileCta);
  }

  if ('IntersectionObserver' in window) {
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? visibleExclusions.add(entry.target) : visibleExclusions.delete(entry.target));
      requestCtaUpdate();
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    exclusionSections.forEach((section) => ctaObserver.observe(section));
  }

  window.addEventListener('scroll', requestCtaUpdate, { passive: true });
  window.addEventListener('resize', requestCtaUpdate);
  document.addEventListener('focusin', requestCtaUpdate);
  document.addEventListener('focusout', requestCtaUpdate);
  updateMobileCta();
}
