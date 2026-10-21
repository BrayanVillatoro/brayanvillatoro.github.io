/* ===================================
   Brayan Villatoro — Site JavaScript
   =================================== */

document.addEventListener('DOMContentLoaded', function () {

  // ---- Language (EN / DA) ----
  // English lives in the HTML; Danish is provided via data-da attributes
  // (and data-da-ph for input placeholders). Choice is saved in localStorage.
  var currentLang = 'en';
  try { if (localStorage.getItem('lang') === 'da') currentLang = 'da'; } catch (e) {}

  var I18N = {
    projectsError: { en: 'Could not load projects.', da: 'Kunne ikke indlæse projekter.' },
    noDesc: { en: 'No description available.', da: 'Ingen beskrivelse tilgængelig.' },
    viewGithub: { en: 'View on GitHub', da: 'Se på GitHub' },
    loadMore: { en: 'Load More Projects', da: 'Indlæs flere projekter' },
    loading: { en: 'Loading…', da: 'Indlæser…' },
    sending: { en: 'Sending…', da: 'Sender…' },
    sent: { en: 'Sent!', da: 'Sendt!' },
    formError: { en: 'Error. Try again.', da: 'Fejl. Prøv igen.' }
  };
  function t(key) { return (I18N[key] && I18N[key][currentLang]) || (I18N[key] && I18N[key].en) || ''; }

  function applyLang(lang) {
    currentLang = (lang === 'da') ? 'da' : 'en';
    var isDa = currentLang === 'da';
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-da]').forEach(function (el) {
      var hasKids = el.children.length > 0;
      if (el.dataset.en === undefined) el.dataset.en = hasKids ? el.innerHTML : el.textContent;
      var val = isDa ? el.getAttribute('data-da') : el.dataset.en;
      if (hasKids) { el.innerHTML = val; } else { el.textContent = val; }
    });
    document.querySelectorAll('[data-da-ph]').forEach(function (el) {
      if (el.dataset.enPh === undefined) el.dataset.enPh = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', isDa ? el.getAttribute('data-da-ph') : el.dataset.enPh);
    });
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.classList.toggle('lang-active', b.getAttribute('data-lang-btn') === currentLang);
    });
    try { localStorage.setItem('lang', currentLang); } catch (e) {}
  }

  document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang-btn')); });
  });

  applyLang(currentLang);

  // ---- Copyright Year ----
  var yearEls = document.querySelectorAll('#copyright-year');
  yearEls.forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ---- Mobile Menu Toggle ----
  var menuBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var iconOpen = document.getElementById('menu-icon-open');
  var iconClose = document.getElementById('menu-icon-close');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var isHidden = mobileMenu.classList.toggle('hidden');
      if (iconOpen) iconOpen.classList.toggle('hidden', !isHidden);
      if (iconClose) iconClose.classList.toggle('hidden', isHidden);
    });
  }

  // ---- Header Shadow on Scroll ----
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ---- Fade-In on Scroll (IntersectionObserver) ----
  var fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    fadeEls.forEach(function (el) { obs.observe(el); });
  } else {
    // Fallback: show everything
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ---- Quote Carousel ----
  var carousel = document.getElementById('quote-carousel');
  var quotePrev = document.getElementById('quote-prev');
  var quoteNext = document.getElementById('quote-next');
  var quoteCurrent = document.getElementById('quote-current');
  var quoteTotal = document.getElementById('quote-total');

  if (carousel) {
    var slides = carousel.querySelectorAll('.quote-slide');
    var currentIndex = 0;
    var autoplayTimer = null;

    if (quoteTotal) quoteTotal.textContent = String(slides.length).padStart(2, '0');

    function showSlide(index) {
      slides.forEach(function (slide, i) {
        slide.style.opacity = i === index ? '1' : '0';
        slide.classList.toggle('active', i === index);
      });
      if (quoteCurrent) quoteCurrent.textContent = String(index + 1).padStart(2, '0');
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    }

    function resetAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(nextSlide, 5000);
    }

    if (quoteNext) {
      quoteNext.addEventListener('click', function () {
        nextSlide();
        resetAutoplay();
      });
    }

    if (quotePrev) {
      quotePrev.addEventListener('click', function () {
        prevSlide();
        resetAutoplay();
      });
    }

    // Auto-rotate every 5 seconds
    autoplayTimer = setInterval(nextSlide, 5000);
  }

  // ---- GitHub Projects ----
  var projectsGrid = document.getElementById('projects-grid');
  var loadingProjects = document.getElementById('loading-projects');
  var loadMoreWrap = document.getElementById('load-more-wrap');
  var GITHUB_USERNAME = 'brayanvillatoro';
  var projectsPage = 1;
  var PER_PAGE = 9;

  function loadProjects(append) {
    if (!projectsGrid) return;

    var url = 'https://api.github.com/users/' + GITHUB_USERNAME +
      '/repos?sort=pushed&direction=desc&per_page=' + PER_PAGE + '&page=' + projectsPage;

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('GitHub API error');
        return res.json();
      })
      .then(function (repos) {
        if (loadingProjects) loadingProjects.style.display = 'none';

        if (!append) projectsGrid.innerHTML = '';

        var visible = repos.filter(function (repo) { return !repo.fork && !repo.archived; });
        visible.forEach(function (repo) {
          var card = document.createElement('div');
          card.className = 'project-card fade-in visible';

          var title = document.createElement('h3');
          title.className = 'text-lg font-semibold text-[#1d1d1f] mt-4 mb-2';
          title.textContent = repo.name;

          var desc = document.createElement('p');
          desc.className = 'text-sm text-[#86868b] leading-relaxed mb-4';
          if (repo.description) {
            desc.textContent = repo.description;
          } else {
            desc.textContent = I18N.noDesc.en;
            desc.setAttribute('data-da', I18N.noDesc.da);
          }

          var link = document.createElement('a');
          link.href = repo.html_url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.className = 'case-link text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1d1d1f] inline-flex items-center gap-2';
          link.innerHTML = '<span data-da="' + I18N.viewGithub.da + '">' + I18N.viewGithub.en + '</span> <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7v10"/></svg>';

          card.appendChild(title);
          card.appendChild(desc);
          card.appendChild(link);
          projectsGrid.appendChild(card);
        });

        // Load More button
        if (loadMoreWrap) {
          loadMoreWrap.innerHTML = '';
          if (repos.length >= PER_PAGE) {
            var btn = document.createElement('button');
            btn.className = 'case-link text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1d1d1f] border border-gray-300 px-8 py-4 inline-flex items-center gap-2 hover:border-[#1d1d1f] transition-colors';
            btn.innerHTML = '<span data-da="' + I18N.loadMore.da + '">' + I18N.loadMore.en + '</span> <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>';
            btn.addEventListener('click', function () {
              projectsPage++;
              btn.textContent = t('loading');
              btn.disabled = true;
              loadProjects(true);
            });
            loadMoreWrap.appendChild(btn);
          }
        }

        // Sync any newly added cards/button with the current language.
        applyLang(currentLang);
      })
      .catch(function (err) {
        console.error('Error loading projects:', err);
        if (loadingProjects) {
          loadingProjects.style.display = '';
          loadingProjects.removeAttribute('data-en');
          loadingProjects.setAttribute('data-da', I18N.projectsError.da);
          loadingProjects.textContent = I18N.projectsError.en;
          applyLang(currentLang);
        }
      });
  }

  loadProjects(false);

  // ---- Contact Form AJAX ----
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('button[type="submit"]');
      var originalHTML = btn.innerHTML;
      btn.textContent = t('sending');
      btn.disabled = true;

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            contactForm.reset();
            btn.textContent = t('sent');
            setTimeout(function () {
              btn.innerHTML = originalHTML;
              btn.disabled = false;
            }, 3000);
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(function () {
          btn.textContent = t('formError');
          btn.disabled = false;
          setTimeout(function () {
            btn.innerHTML = originalHTML;
          }, 3000);
        });
    });
  }

  // ---- Video Play Buttons ----
  document.querySelectorAll('.video-play-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var container = btn.closest('.group') || btn.parentElement;
      var video = container ? container.querySelector('video') : null;
      if (video) {
        if (video.paused) {
          video.play();
          btn.style.opacity = '0';
        } else {
          video.pause();
          btn.style.opacity = '';
        }
      }
    });
  });

  // ---- Smooth Scroll for Hash Links ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var hash = this.getAttribute('href');
      if (!hash || hash === '#') return;
      var target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        var headerHeight = header ? header.getBoundingClientRect().height : 64;
        var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
        // Close mobile menu if open
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
          if (iconOpen) iconOpen.classList.remove('hidden');
          if (iconClose) iconClose.classList.add('hidden');
        }
      }
    });
  });

});
