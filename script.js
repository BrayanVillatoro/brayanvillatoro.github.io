const GITHUB_USERNAME = 'brayanvillatoro';
const MOBILE_BREAKPOINT = 768;
const REPOS_PER_PAGE_MOBILE = 5;
const REPOS_PER_PAGE_DESKTOP = 10;

const timelineContainer = document.getElementById('timeline-container');
const loadingElement = document.getElementById('loading');
const formResponse = document.getElementById('form-response');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const aboutLink = document.getElementById('about-link');
let aboutModal = document.getElementById('about-modal');
const contactLink = document.getElementById('contact-link');
let contactModal = document.getElementById('contact-modal');
const loadMoreWrap = document.querySelector('.load-more-wrap');

let page = 1;

async function loadGitHubTimeline(loadMore = false) {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const perPage = isMobile ? REPOS_PER_PAGE_MOBILE : REPOS_PER_PAGE_DESKTOP;
    const apiUrl = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=created&direction=asc&per_page=${perPage}&page=${page}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch GitHub data');
        }
        const repos = await response.json();

        if (repos.length === 0 && page === 1) {
            timelineContainer.innerHTML = '<p class="text-center text-gray-500">No public projects found.</p>';
            loadingElement.style.display = 'none';
            return;
        }

        if (!loadMore) {
            timelineContainer.innerHTML = '';
        }
        loadingElement.style.display = 'none';

        repos.forEach((repo, index) => {
            // Render as a simple work card
            const card = document.createElement('article');
            card.className = 'work-card';

            // Use repo topics or language as a lightweight image stand-in
            const img = document.createElement('img');
            img.alt = repo.name;
            // generate a simple placeholder gradient via data URL using repo id to vary color
            const hue = (index * 47 + (page * 13)) % 360;
            img.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='720'><rect width='100%' height='100%' fill='hsl(${hue} 60% 78%)'/></svg>`;

            const body = document.createElement('div');
            body.className = 'work-body';

            const title = document.createElement('h3');
            title.textContent = repo.name;

            const desc = document.createElement('p');
            desc.textContent = repo.description || 'No description available.';

            const link = document.createElement('a');
            link.href = repo.html_url;
            link.target = '_blank';
            link.className = 'project-link';
            link.textContent = 'View on GitHub';

            body.appendChild(title);
            body.appendChild(desc);
            body.appendChild(link);
            card.appendChild(img);
            card.appendChild(body);
            timelineContainer.appendChild(card);
        });

        // Add Load More button if more repos exist
        if (repos.length >= perPage) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.textContent = 'Load more projects +';
            loadMoreBtn.className = 'load-more-btn';
            loadMoreBtn.onclick = () => {
                page++;
                loadGitHubTimeline(true);
                loadMoreBtn.disabled = true;
                loadMoreBtn.textContent = 'Loading…';
            };
            // append or replace inside the load-more-wrap
            if (loadMoreWrap) {
                loadMoreWrap.innerHTML = '';
                loadMoreWrap.appendChild(loadMoreBtn);
            }
        } else if (loadMoreWrap) {
            loadMoreWrap.innerHTML = '';
        }

    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        timelineContainer.innerHTML = '<p class="text-center text-red-500">Error loading projects.</p>';
        loadingElement.style.display = 'none';
    }
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            const offset = target.getBoundingClientRect().top + window.scrollY - 60;
            window.scrollTo({
                top: offset,
                behavior: 'smooth'
            });
        }
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    });
});

/*
 Header-aware scroll helper: scrolls to an element id with a pixel-perfect offset
 to account for the sticky header. Also supports cross-page hash navigation by
 storing the desired hash in sessionStorage before navigation and applying it on load.
*/
function scrollToHashWithOffset(hash, smooth = true) {
    if (!hash) return false;
    try {
        const id = hash.startsWith('#') ? hash : `#${hash}`;
        const el = document.querySelector(id);
        if (!el) return false;
        const header = document.querySelector('header');
        const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) + 8 : 80;
        const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
        return true;
    } catch (e) {
        return false;
    }
}

// If the page was opened with a hash (direct link), ensure we scroll with an offset
window.addEventListener('load', () => {
    // First check sessionStorage for a saved cross-page hash
    try {
        const pending = sessionStorage.getItem('anchor-scroll-hash');
        const pendingPath = sessionStorage.getItem('anchor-scroll-path');
        if (pending) {
            // If no path specified or path matches current, perform the scroll
            if (!pendingPath || pendingPath === window.location.pathname) {
                // Use instant (auto) behavior on load to avoid jumpiness
                scrollToHashWithOffset(pending, false);
                sessionStorage.removeItem('anchor-scroll-hash');
                sessionStorage.removeItem('anchor-scroll-path');
                return;
            }
        }
    } catch (e) {
        // ignore storage errors
    }

    if (location.hash) {
        // perform a non-smooth scroll on load for pixel-perfect placement
        scrollToHashWithOffset(location.hash, false);
    }
});

// Intercept clicks on links that include a hash but point to another page
document.querySelectorAll('a[href*="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href) return;
        // If the href includes a hash and points to a different pathname, store the hash
        const url = new URL(href, window.location.href);
        if (url.hash) {
            try {
                // persist the requested hash and the pathname so the target page can apply the offset
                sessionStorage.setItem('anchor-scroll-hash', url.hash);
                // only store the pathname if the link targets a different path
                if (url.pathname !== window.location.pathname) sessionStorage.setItem('anchor-scroll-path', url.pathname);
            } catch (err) {
                // ignore storage issues
            }
        }
    });
});

// Mobile menu toggle
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// About modal handlers
function openModal() {
    if (!aboutModal) return;
    // mark modal as open and let CSS animate (blur + opacity)
    aboutModal.setAttribute('aria-hidden', 'false');
    aboutModal.classList.add('is-open');
    // small delay so the browser can apply the 'is-open' state, then flip active for transitions
    requestAnimationFrame(() => requestAnimationFrame(() => aboutModal.classList.add('is-active')));
    // lock body scroll
    document.body.classList.add('modal-open');
}

function closeModal() {
    if (!aboutModal) return;
    // Immediately hide the modal and restore scroll. This matches the requested
    // behavior where the backdrop blur animates in on open but disappears instantly on close.
    aboutModal.classList.remove('is-active');
    aboutModal.classList.remove('is-open');
    aboutModal.classList.remove('is-closing');
    aboutModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

if (aboutLink && aboutModal) {
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    aboutModal.addEventListener('click', (e) => {
        const close = e.target && e.target.getAttribute && e.target.getAttribute('data-close');
        if (close) closeModal();
    });

    const closeBtn = aboutModal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// Contact modal handlers (mirror About modal behavior)
function openContact() {
    if (!contactModal) return;
    contactModal.setAttribute('aria-hidden', 'false');
    contactModal.classList.add('is-open');
    requestAnimationFrame(() => requestAnimationFrame(() => contactModal.classList.add('is-active')));
    document.body.classList.add('modal-open');
}

function closeContact() {
    if (!contactModal) return;
    contactModal.classList.remove('is-active');
    contactModal.classList.remove('is-open');
    contactModal.classList.remove('is-closing');
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

if (contactLink && contactModal) {
    contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        openContact();
    });

    contactModal.addEventListener('click', (e) => {
        const close = e.target && e.target.getAttribute && e.target.getAttribute('data-close');
        if (close) closeContact();
    });

    const closeBtnContact = contactModal.querySelector('.modal-close');
    if (closeBtnContact) closeBtnContact.addEventListener('click', closeContact);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeContact();
    });
}

// Helper: fetch modal markup from index.html and inject into the current document
const modalFetchCache = { fetched: false, doc: null };
async function fetchModalFromIndex(modalId) {
    // If already present in the DOM, return it
    const existing = document.getElementById(modalId);
    if (existing) return existing;

    try {
        // If we've already fetched index.html once, reuse the parsed doc
        let doc;
        if (modalFetchCache.fetched && modalFetchCache.doc) {
            doc = modalFetchCache.doc;
        } else {
            const res = await fetch('index.html');
            const text = await res.text();
            const parser = new DOMParser();
            doc = parser.parseFromString(text, 'text/html');
            modalFetchCache.fetched = true;
            modalFetchCache.doc = doc;
        }

        const modalEl = doc.getElementById(modalId);
        if (!modalEl) return null;

        // Import node into current document and append to body
        const imported = document.importNode(modalEl, true);
        document.body.appendChild(imported);

        // Update references so other functions can see the modal
        if (modalId === 'about-modal') aboutModal = document.getElementById('about-modal');
        if (modalId === 'contact-modal') contactModal = document.getElementById('contact-modal');

        return document.getElementById(modalId);
    } catch (e) {
        console.warn('Failed to fetch modal from index.html', e);
        return null;
    }
}

// Bindings for a modal element (backdrop click, close button, Escape key)
function bindModalInteractions(modalEl, closeFn) {
    if (!modalEl || modalEl.dataset.modalBound) return;

    modalEl.addEventListener('click', (e) => {
        const close = e.target && e.target.getAttribute && e.target.getAttribute('data-close');
        if (close) closeFn();
    });

    const closeBtn = modalEl.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeFn);

    // Escape closes this modal
    const escHandler = (e) => { if (e.key === 'Escape') closeFn(); };
    document.addEventListener('keydown', escHandler);

    modalEl.dataset.modalBound = 'true';
}

// Form response handling - opt-in AJAX. By default the form will POST natively so Formspree's HTML
if (formResponse) {
    const form = document.querySelector('.contact-form');
}

// Handle window resize to reload timeline if needed
let isMobilePrevious = window.innerWidth <= MOBILE_BREAKPOINT;
window.addEventListener('resize', () => {
    const isMobileCurrent = window.innerWidth <= MOBILE_BREAKPOINT;
    if (isMobileCurrent !== isMobilePrevious) {
        page = 1;
        loadGitHubTimeline();
        isMobilePrevious = isMobileCurrent;
    }
});

document.addEventListener('DOMContentLoaded', () => loadGitHubTimeline());

// Collapsible job descriptions (Read more / Read less)
function initJobToggles() {
    const jobs = document.querySelectorAll('.job');
    if (!jobs || jobs.length === 0) return;

    jobs.forEach(job => {
        const desc = job.querySelector('.job-desc');
        if (!desc) return;
    // Hide the description by default; show only role/company/date
        desc.classList.add('is-hidden');
    // Ensure we don't create duplicate buttons
    const existingBtn = job.querySelector('.job-toggle');
    if (existingBtn) existingBtn.remove();

        // Create the toggle button and place it after the job head
        const head = job.querySelector('.job-head');
        const btn = document.createElement('button');
        btn.className = 'job-toggle';
        btn.type = 'button';
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = 'Read more';

        if (head) {
            head.insertAdjacentElement('afterend', btn);
        } else {
            job.appendChild(btn);
        }

        // Toggle behavior: reveal/hide the description
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            if (expanded) {
                desc.classList.add('is-hidden');
                btn.setAttribute('aria-expanded', 'false');
                btn.textContent = 'Read more';
            } else {
                desc.classList.remove('is-hidden');
                btn.setAttribute('aria-expanded', 'true');
                btn.textContent = 'Read less';
            }
        });
    });
}

// Initialize job toggles once the DOM is ready. Also re-run on window resize
document.addEventListener('DOMContentLoaded', initJobToggles);
window.addEventListener('resize', debounce(initJobToggles, 200));

/*
  Small fallback to normalize third-party embed sizing (Strava).
  Some embed scripts inject inline width/height or extra wrappers after load.
  This snippet uses a MutationObserver to detect when the Strava placeholder
  receives children and then strips width/height attributes and applies
  a CSS-friendly class to ensure the embed fits its card.
*/
function normalizeStravaEmbed() {
    const placeholder = document.querySelector('.strava-embed-placeholder');
    if (!placeholder) return;

    const applyFix = (node) => {
        try {
            // remove inline size attributes on elements
            ['width', 'height', 'style'].forEach(attr => {
                if (node.hasAttribute && node.hasAttribute(attr)) {
                    // keep other style rules but strip width/height from style attribute
                    if (attr === 'style') {
                        const style = node.getAttribute('style');
                        const cleaned = style.replace(/(?:\bwidth\s*:\s*[^;]+;?)|(?:\bheight\s*:\s*[^;]+;?)/g, '');
                        node.setAttribute('style', cleaned);
                    } else {
                        node.removeAttribute(attr);
                    }
                }
            });

            // force sizing-friendly classes
            node.classList && node.classList.add('normalized-embed-node');
        } catch (e) {
            // ignore errors for third-party nodes we can't modify
            console.warn('normalizeStravaEmbed: failed to clean node', e);
        }
    };

    const observer = new MutationObserver((mutations, obs) => {
        for (const m of mutations) {
            for (const n of m.addedNodes) {
                applyFix(n);
                // also fix descendants
                if (n.querySelectorAll) {
                    n.querySelectorAll('*').forEach(applyFix);
                }
            }
        }

        // If the placeholder has at least one iframe or visible content, stop observing
        if (placeholder.querySelector('iframe, .strava-embed-wrapper, img')) {
            obs.disconnect();
        }
    });

    // Start observing for child additions and subtree changes
    observer.observe(placeholder, { childList: true, subtree: true });

    // Also attempt a one-time pass in case the embed already exists
    applyFix(placeholder);
    placeholder.querySelectorAll('*').forEach(applyFix);

    // If a third-party embed doesn't appear within a short window, provide a graceful fallback
    const maybeInjectFallback = () => {
        const found = placeholder.querySelector('iframe, .strava-embed-wrapper, img');
        if (!found) {
            // Build a safe fallback link to the Strava activity using data attributes
            const id = placeholder.dataset && placeholder.dataset.embedId ? placeholder.dataset.embedId : null;
            const href = id ? `https://www.strava.com/activities/${id}` : 'https://www.strava.com/' ;
            // Avoid overwriting a working embed; check again before replacing
            const still = placeholder.querySelector('iframe, .strava-embed-wrapper, img');
            if (!still) {
                placeholder.innerHTML = '';
                const a = document.createElement('a');
                a.className = 'strava-fallback';
                a.href = href;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = id ? 'View activity on Strava' : 'Open Strava';
                placeholder.appendChild(a);
            }
        }
    };

    // Run fallback check after a short delay to allow the remote script time to inject
    setTimeout(maybeInjectFallback, 1200);
}

// Run after window load to give third-party scripts time to inject
window.addEventListener('load', () => {
    normalizeStravaEmbed();
    // run again after a short delay in case the embed loads slowly
    setTimeout(normalizeStravaEmbed, 800);
});

// If the user navigates to the site with a hash (e.g. index.html#about or #contact),
// open the matching modal if available. This also supports links from other pages
// that point to index.html#about (or #contact).
function openModalFromHash() {
    const h = window.location.hash;
    if (!h) return;
    if ((h === '#about' || h === '#about-modal') && typeof openModal === 'function') {
        // If the about modal exists on this page, open it.
        if (aboutModal) openModal();
    }
    if ((h === '#contact' || h === '#contact-modal') && typeof openContact === 'function') {
        if (contactModal) openContact();
    }
}

// Click delegation for About/Contact links so they work from any page.
// If the modal isn't present on the current page, navigate to index.html#<hash>
// which will trigger `openModalFromHash` after navigation.
document.addEventListener('click', async (e) => {
    const a = e.target.closest && e.target.closest('a');
    if (!a) return;

    if (a.id === 'about-link') {
        e.preventDefault();
        if (!aboutModal) {
            // try to fetch modal markup from index.html and inject it
            await fetchModalFromIndex('about-modal');
            // bind interactions for the injected modal
            bindModalInteractions(aboutModal, closeModal);
        }

        if (aboutModal) {
            openModal();
            history.replaceState(null, '', '#about');
        }
    }

    if (a.id === 'contact-link') {
        e.preventDefault();
        if (!contactModal) {
            await fetchModalFromIndex('contact-modal');
            bindModalInteractions(contactModal, closeContact);
        }

        if (contactModal) {
            openContact();
            history.replaceState(null, '', '#contact');
        }
    }
});

// Run hash-opening once the DOM is ready (handles direct links and navigation from other pages)
document.addEventListener('DOMContentLoaded', openModalFromHash);

/* Header pill anchoring: measure brand and about link and set CSS vars so the pill spans between them */
function anchorHeaderPill() {
    const headerRow = document.querySelector('.header-row');
    if (!headerRow) return;

    const brand = headerRow.querySelector('.brand');
    const about = document.getElementById('about-link') || headerRow.querySelector('.project-request');

    // If either anchor is missing, fall back to CSS defaults
    if (!brand || !about) return;

    // Temporarily hide the pill while re-measuring to avoid mid-measure flashes
    headerRow.classList.remove('pill-ready');

    const rowRect = headerRow.getBoundingClientRect();
    const brandRect = brand.getBoundingClientRect();
    const aboutRect = about.getBoundingClientRect();

    // Compute left offset from headerRow's left edge to the pill's left.
    // Subtract extra inset so the pill reaches further left (negative values allowed to push beyond row's left).
        let leftPx = Math.round(brandRect.left - rowRect.left - 48);
    // clamp to avoid extreme values
    leftPx = Math.max(-300, Math.min(leftPx, Math.round(rowRect.width / 2)));

    // Compute right offset from headerRow's right edge to the pill's right; subtract extra inset to push further right
    let rightPx = Math.round(rowRect.right - aboutRect.right - 48);
    rightPx = Math.max(-300, Math.min(rightPx, Math.round(rowRect.width / 2)));

    // Vertical center of the pill: bias farther downward so the top clears browser chrome
    const centerY = (brandRect.top + brandRect.height / 2) - rowRect.top;
        let topPercent = (centerY / rowRect.height) * 100 + 8; // smaller downward bias to bring the pill up
        topPercent = Math.max(48, Math.min(topPercent, 110));

    // Choose a narrower pill height to reduce top/bottom spacing
        const pillHeight = Math.min(76, Math.max(48, Math.round(rowRect.height * 0.95)));

    // Write CSS variables on the headerRow to control the pseudo-element
    headerRow.style.setProperty('--pill-left', `${leftPx}px`);
    headerRow.style.setProperty('--pill-right', `${rightPx}px`);
    headerRow.style.setProperty('--pill-top', `${topPercent}%`);
    headerRow.style.setProperty('--pill-height', `${pillHeight}px`);
    // Reveal the pill now that measurements are stable
    headerRow.classList.add('pill-ready');
}

// Debounce helper
function debounce(fn, wait = 120) {
    let t;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

const anchored = debounce(anchorHeaderPill, 120);
window.addEventListener('resize', anchored);
window.addEventListener('orientationchange', anchored);
document.addEventListener('DOMContentLoaded', anchorHeaderPill);
window.addEventListener('load', () => setTimeout(anchorHeaderPill, 80));