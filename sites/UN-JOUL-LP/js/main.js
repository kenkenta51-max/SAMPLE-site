document.addEventListener("DOMContentLoaded", function () {
  var header = document.getElementById("header");
  var toggle = document.getElementById("header-toggle");
  var nav = document.getElementById("header-nav");

  function updateHeaderState() {
    if (window.scrollY > 10) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState);

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  var fadeTargets = document.querySelectorAll(
    ".worries, .concept, .reason-carousel, .service__item, .voice__card, .access__content"
  );
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    fadeTargets.forEach(function (el) {
      el.classList.add("fade-in");
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 100px 0px" }
    );

    fadeTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // セーフティネット：何らかの理由でIntersectionObserverが発火しない場合に
  // コンテンツが非表示のまま残らないようにする
  window.addEventListener("load", function () {
    setTimeout(function () {
      fadeTargets.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }, 4000);
  });

  // スクロール進捗バー
  var progressBar = document.getElementById("scroll-progress");

  function updateScrollProgress() {
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
    progressBar.style.width = ratio + "%";
  }

  if (progressBar) {
    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
  }

  // FVのパララックス（背景をゆっくり動かして奥行きを出す）
  var fvBg = document.getElementById("fv-bg");
  var fvSection = document.querySelector(".fv");

  function updateParallax() {
    if (!fvBg || !fvSection) return;
    var fvHeight = fvSection.offsetHeight;
    if (window.scrollY > fvHeight) return;
    var offset = Math.min(window.scrollY * 0.12, 50);
    fvBg.style.transform = "translateY(" + offset + "px)";
  }

  if (fvBg && !prefersReducedMotion) {
    window.addEventListener("scroll", updateParallax, { passive: true });
  }

  // 選ばれる理由：カルーセル
  var carouselTrack = document.getElementById("reason-track");
  var carouselPrev = document.getElementById("reason-prev");
  var carouselNext = document.getElementById("reason-next");
  var carouselThumbs = document.querySelectorAll("#reason-thumbs .reason-carousel__thumb");
  var carouselSlides = carouselTrack ? carouselTrack.querySelectorAll(".reason-carousel__slide") : [];
  var currentSlide = 0;

  function goToSlide(index) {
    if (!carouselTrack || carouselSlides.length === 0) return;
    currentSlide = (index + carouselSlides.length) % carouselSlides.length;
    carouselTrack.style.transform = "translateX(-" + currentSlide * 100 + "%)";

    carouselSlides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === currentSlide);
    });
    carouselThumbs.forEach(function (thumb, i) {
      thumb.classList.toggle("is-active", i === currentSlide);
    });
  }

  if (carouselTrack) {
    if (carouselPrev) {
      carouselPrev.addEventListener("click", function () {
        goToSlide(currentSlide - 1);
      });
    }
    if (carouselNext) {
      carouselNext.addEventListener("click", function () {
        goToSlide(currentSlide + 1);
      });
    }
    carouselThumbs.forEach(function (thumb, i) {
      thumb.addEventListener("click", function () {
        goToSlide(i);
      });
    });
  }
});
