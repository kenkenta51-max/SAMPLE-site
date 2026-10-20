const header = document.querySelector('[data-header]');
const hero = document.querySelector('.hero');
const scrollCue = document.querySelector('[data-scroll-cue]');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const updateScrollState = () => {
  const pastHero = window.scrollY >= hero.offsetHeight - header.offsetHeight;
  header.classList.toggle('is-scrolled', pastHero);
  scrollCue.classList.toggle('is-hidden', window.scrollY > 24);
};
window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('resize', updateScrollState);
updateScrollState();

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  mobileMenu.classList.toggle('is-open', open);
});
mobileMenu.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'メニューを開く');
  mobileMenu.classList.remove('is-open');
});

const observer = !reducedMotion.matches && 'IntersectionObserver' in window
  ? new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' })
  : null;

document.querySelectorAll('.reveal').forEach(element => {
  if (observer) observer.observe(element);
  else element.classList.add('is-visible');
});
const featureList = document.querySelector('[data-reveal-list]');
if (observer) observer.observe(featureList);
else featureList.classList.add('is-visible');

const slider = document.querySelector('[data-style-slider]');
const track = slider.querySelector('.style-track');
const allSlides = [...slider.querySelectorAll('.style-slide')];
const previousButton = slider.querySelector('.slider-prev');
const nextButton = slider.querySelector('.slider-next');
const currentLabel = slider.querySelector('[data-current]');
const totalLabel = slider.querySelector('[data-total]');
const progress = slider.querySelector('.slider-status b');
const tabs = [...document.querySelectorAll('[data-filter]')];
let activeSlides = [...allSlides];
let slideIndex = 0;
let pointerStart = null;

const visibleCount = () => matchMedia('(max-width: 600px)').matches ? 1 : 3;
const maxIndex = () => Math.max(0, activeSlides.length - visibleCount());
const renderSlider = () => {
  slideIndex = Math.min(Math.max(slideIndex, 0), maxIndex());
  const firstSlide = activeSlides[0];
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  const step = firstSlide ? firstSlide.getBoundingClientRect().width + gap : 0;
  track.style.transform = `translate3d(${-slideIndex * step}px,0,0)`;
  currentLabel.textContent = String(slideIndex + 1).padStart(2, '0');
  totalLabel.textContent = String(activeSlides.length).padStart(2, '0');
  progress.style.width = `${activeSlides.length ? ((slideIndex + visibleCount()) / activeSlides.length) * 100 : 100}%`;
  previousButton.disabled = slideIndex === 0;
  nextButton.disabled = slideIndex === maxIndex();
};
const moveSlider = direction => { slideIndex += direction; renderSlider(); };
previousButton.addEventListener('click', () => moveSlider(-1));
nextButton.addEventListener('click', () => moveSlider(1));
slider.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); moveSlider(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); moveSlider(1); }
});
const viewport = slider.querySelector('.style-viewport');
viewport.addEventListener('pointerdown', event => { pointerStart = event.clientX; });
viewport.addEventListener('pointerup', event => {
  if (pointerStart === null) return;
  const distance = event.clientX - pointerStart;
  if (Math.abs(distance) > 38) moveSlider(distance < 0 ? 1 : -1);
  pointerStart = null;
});
viewport.addEventListener('pointercancel', () => { pointerStart = null; });

tabs.forEach(tab => tab.addEventListener('click', () => {
  const filter = tab.dataset.filter;
  tabs.forEach(item => {
    const selected = item === tab;
    item.classList.toggle('is-active', selected);
    item.setAttribute('aria-selected', String(selected));
  });
  allSlides.forEach(slide => { slide.hidden = filter !== 'all' && slide.dataset.category !== filter; });
  activeSlides = allSlides.filter(slide => !slide.hidden);
  slideIndex = 0;
  renderSlider();
}));
window.addEventListener('resize', renderSlider);
requestAnimationFrame(renderSlider);
