document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

// Mobile navigation toggle
(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      var nextExpanded = !expanded;
      toggle.setAttribute('aria-expanded', String(nextExpanded));
      toggle.setAttribute('aria-label', nextExpanded ? toggle.dataset.labelClose : toggle.dataset.labelOpen);
      nav.classList.toggle('is-open');
    });
  }

})();

// Click-to-load Google Maps after user consent
(function () {
  'use strict';

  var button = document.querySelector('[data-map-load]');
  var container = document.getElementById('map-container');

  if (!button || !container) return;

  button.addEventListener('click', function () {
    var iframe = document.createElement('iframe');
    iframe.title = button.dataset.mapTitle;
    iframe.src = button.dataset.mapSrc;
    iframe.width = '100%';
    iframe.height = '400';
    iframe.style.border = '0';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;

    container.replaceChildren(iframe);
  });
})();

// Scroll-spy: keep the sticky navigation aligned with the section below it.
(function () {
  'use strict';

  var navLinks = document.querySelectorAll('.storitve-nav__link[href^="#"]');
  if (!navLinks.length) return;

  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var section = document.getElementById(id);
    if (section) sections.push({ el: section, link: link });
  });

  if (!sections.length) return;

  var activeClass = 'storitve-nav__link--active';
  var activeLink = null;
  var nav = navLinks[0].closest('.storitve-nav');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var pendingClickLink = null;
  var scrollEndTimer = null;
  var clickFallbackTimer = null;
  var frameRequested = false;

  function centerActiveLink(link) {
    var list = link.closest('.storitve-nav__list');
    if (!list) return;

    var targetLeft = link.offsetLeft - ((list.clientWidth - link.offsetWidth) / 2);
    list.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
    });
  }

  function setActiveLink(link) {
    if (activeLink === link) return;

    navLinks.forEach(function (navLink) {
      navLink.classList.remove(activeClass);
      navLink.removeAttribute('aria-current');
    });

    if (link) {
      link.classList.add(activeClass);
      link.setAttribute('aria-current', 'location');
      centerActiveLink(link);
    }

    activeLink = link;
  }

  function getActivationLine() {
    if (!nav) return 0;

    var stickyTop = parseFloat(window.getComputedStyle(nav).top);
    if (isNaN(stickyTop)) stickyTop = 0;

    return stickyTop + nav.offsetHeight + 16;
  }

  function updateActiveLink() {
    if (pendingClickLink) return;

    var activationLine = getActivationLine();
    var match = null;

    sections.forEach(function (section) {
      if (section.el.getBoundingClientRect().top <= activationLine) {
        match = section;
      }
    });

    var pageBottom = window.scrollY + window.innerHeight;
    var atPageBottom = pageBottom >= document.documentElement.scrollHeight - 2;
    if (atPageBottom) match = sections[sections.length - 1];

    setActiveLink(match ? match.link : null);
  }

  function requestActiveUpdate() {
    if (frameRequested) return;

    frameRequested = true;
    window.requestAnimationFrame(function () {
      frameRequested = false;
      updateActiveLink();
    });
  }

  function releaseClickLock() {
    if (!pendingClickLink) return;

    pendingClickLink = null;
    window.clearTimeout(scrollEndTimer);
    window.clearTimeout(clickFallbackTimer);
    requestActiveUpdate();
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      pendingClickLink = link;
      setActiveLink(link);

      window.clearTimeout(scrollEndTimer);
      window.clearTimeout(clickFallbackTimer);
      clickFallbackTimer = window.setTimeout(releaseClickLock, 5000);
    });
  });

  window.addEventListener('scroll', function () {
    if (pendingClickLink) {
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(releaseClickLock, 180);
      return;
    }

    requestActiveUpdate();
  }, { passive: true });

  window.addEventListener('resize', requestActiveUpdate);
  requestActiveUpdate();
})();
