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
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
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
    }, 6000);
  }

  /* Nav shadow on scroll */
  var nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 8 ? '0 6px 20px rgba(10,31,61,.08)' : 'none';
    });
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