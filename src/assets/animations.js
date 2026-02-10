/**
 * Reveal-on-scroll animations (Dawn-style).
 * Used when theme setting "Reveal sections on scroll" is enabled.
 */
(function () {
  'use strict';

  const SCROLL_ANIMATION_TRIGGER_CLASSNAME = 'scroll-trigger';
  const SCROLL_ANIMATION_OFFSCREEN_CLASSNAME = 'scroll-trigger--offscreen';
  const SCROLL_ZOOM_IN_TRIGGER_CLASSNAME = 'animate--zoom-in';
  const SCROLL_ANIMATION_CANCEL_CLASSNAME = 'scroll-trigger--cancel';

  function throttle(fn, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return fn.apply(this, args);
      }
    };
  }

  function onIntersection(entries, observer) {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.classList.contains(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME)) {
          el.classList.remove(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
          if (el.hasAttribute('data-cascade')) {
            el.setAttribute('style', '--animation-order: ' + index + ';');
          }
        }
        observer.unobserve(el);
      } else {
        entry.target.classList.add(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
        entry.target.classList.remove(SCROLL_ANIMATION_CANCEL_CLASSNAME);
      }
    });
  }

  function initializeScrollAnimationTrigger(rootEl, isDesignModeEvent) {
    rootEl = rootEl || document;
    const elements = Array.from(rootEl.getElementsByClassName(SCROLL_ANIMATION_TRIGGER_CLASSNAME));
    if (elements.length === 0) return;

    if (isDesignModeEvent) {
      elements.forEach(function (el) {
        el.classList.add('scroll-trigger--design-mode');
      });
      return;
    }

    const observer = new IntersectionObserver(onIntersection, {
      rootMargin: '0px 0px -50px 0px'
    });
    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function percentageSeen(element) {
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const elementPositionY = element.getBoundingClientRect().top + scrollY;
    const elementHeight = element.offsetHeight;

    if (elementPositionY > scrollY + viewportHeight) return 0;
    if (elementPositionY + elementHeight < scrollY) return 100;

    const distance = scrollY + viewportHeight - elementPositionY;
    return Math.round((distance / ((viewportHeight + elementHeight) / 100)));
  }

  function initializeScrollZoomAnimationTrigger() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = Array.from(document.getElementsByClassName(SCROLL_ZOOM_IN_TRIGGER_CLASSNAME));
    if (elements.length === 0) return;

    const scaleAmount = 0.2 / 100;

    elements.forEach(function (element) {
      let elementIsVisible = false;
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          elementIsVisible = entry.isIntersecting;
        });
      });
      observer.observe(element);

      element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));

      window.addEventListener('scroll', throttle(function () {
        if (!elementIsVisible) return;
        element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));
      }, 16), { passive: true });
    });
  }

  function init() {
    initializeScrollAnimationTrigger();
    initializeScrollZoomAnimationTrigger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function (event) {
      initializeScrollAnimationTrigger(event.target, true);
    });
    document.addEventListener('shopify:section:reorder', function () {
      initializeScrollAnimationTrigger(document, true);
    });
  }
})();
