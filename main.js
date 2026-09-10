function loadComponent(selector, path) {
  return fetch(path)
    .then(function (response) {
      if (!response.ok) throw new Error('Could not load ' + path);
      return response.text();
    })
    .then(function (markup) {
      var container = document.querySelector(selector);
      if (container) container.outerHTML = markup;
    });
}

function initSite() {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  var activeLink = document.querySelector('.nav-links [data-page="' + page + '"]');
  if (activeLink) activeLink.classList.add('active');

  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    heroVideo.playbackRate = 0.5;
  }

  /* Mobile nav toggle */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    var closeMenu = function () {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    var openMenu = function () {
      links.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (links.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    /* Close the drawer after tapping any nav link (incl. Contact) */
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    /* Close when tapping outside the open menu */
    document.addEventListener('click', function (e) {
      if (links.classList.contains('open') && !links.contains(e.target) && e.target !== toggle) {
        closeMenu();
      }
    });

    /* Close on resize back to desktop width */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 640) closeMenu();
    });
  }

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Stat counters (numeric prefix animates, suffix stays) */
  var nums = document.querySelectorAll('.stat-band .num');
  if (nums.length) {
    var animated = false;
    var animateNums = function () {
      if (animated) return;
      animated = true;
      nums.forEach(function (el) {
        var target = el.getAttribute('data-count');
        if (!target) { return; }
        var match = target.match(/[\d.]+/);
        if (!match) { el.textContent = target; return; }
        var end = parseFloat(match[0]);
        var suffix = target.replace(match[0], '');
        var startTime = null;
        var duration = 1200;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var current = (end * progress).toFixed(match[0].includes('.') ? 1 : 0);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    };
    if ('IntersectionObserver' in window) {
      var band = document.querySelector('.stat-band');
      if (band) {
        var bandIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { animateNums(); bandIo.disconnect(); }
          });
        }, { threshold: 0.3 });
        bandIo.observe(band);
      }
    } else {
      animateNums();
    }
  }

  /* Testimonial carousel */
  var slides = document.querySelectorAll('.testi-slide');
  var dots = document.querySelectorAll('.testi-dot');
  if (slides.length) {
    var current = 0;
    var show = function (i) {
      slides.forEach(function (s, idx) { s.classList.toggle('active', idx === i); });
      dots.forEach(function (d, idx) { d.classList.toggle('active', idx === i); });
      current = i;
    };
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () { show(idx); });
    });
    setInterval(function () {
      show((current + 1) % slides.length);
    }, 9000);
  }

  /* Nav shadow on scroll */
  var nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 8 ? '0 6px 20px rgba(10,31,61,.08)' : 'none';
    });
  }

  /* Product gallery thumbnails (scoped per detail panel, since multiple exist on one page) */
  document.querySelectorAll('.gallery-main').forEach(function (main) {
    var scope = main.closest('.pdp-gallery') || document;
    var thumbs = scope.querySelectorAll('.gallery-thumb');
    var views = main.querySelectorAll('.gallery-view');
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var targetId = thumb.getAttribute('data-target');
        thumbs.forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
        views.forEach(function (v) {
          v.classList.toggle('active', v.id === targetId);
        });
      });
    });
  });

  /* Single-page product catalog + detail router (Products page) */
  var catalogView = document.getElementById('catalog-view');
  if (catalogView) {
    var detailSections = document.querySelectorAll('.product-detail');

    var showCatalog = function (skipHistory) {
      catalogView.hidden = false;
      detailSections.forEach(function (d) { d.hidden = true; });
      if (!skipHistory) history.pushState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    var showDetail = function (slug, skipHistory) {
      var panel = document.getElementById('detail-' + slug);
      if (!panel) { showCatalog(skipHistory); return; }
      catalogView.hidden = true;
      detailSections.forEach(function (d) { d.hidden = (d !== panel); });
      if (!skipHistory) history.pushState(null, '', '#pkg-' + slug);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.addEventListener('click', function (e) {
      var back = e.target.closest('[data-action="back"]');
      if (back) {
        e.preventDefault();
        showCatalog();
        return;
      }
      var tile = e.target.closest('[data-product]');
      if (tile) {
        e.preventDefault();
        showDetail(tile.getAttribute('data-product'));
      }
    });

    window.addEventListener('popstate', function () {
      var slug = window.location.hash.replace('#pkg-', '');
      if (slug) { showDetail(slug, true); } else { showCatalog(true); }
    });

    var initialSlug = window.location.hash.replace('#pkg-', '');
    if (initialSlug) {
      showDetail(initialSlug, true);
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  Promise.all([
    loadComponent('[data-component="header"]', './components/header.html'),
    loadComponent('[data-component="footer"]', './components/footer.html')
  ]).then(initSite).catch(function (error) {
    console.error('Shared components failed to load:', error);
  });
});