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
const siteDataLink = document.getElementById('site-data-link');
let siteDataModal = document.getElementById('site-data-modal');
const loadMoreWrap = document.querySelector('.load-more-wrap');
const navToggleBtn = document.querySelector('.nav-toggle');
const mainNav = document.getElementById('main-nav');
// Remember original parent/place so we can restore the nav and toggler after closing
const _navOriginal = mainNav ? { parent: mainNav.parentNode, nextSibling: mainNav.nextSibling } : null;
const _togglerOriginal = navToggleBtn ? { parent: navToggleBtn.parentNode, nextSibling: navToggleBtn.nextSibling, inlineStyle: navToggleBtn.getAttribute && navToggleBtn.getAttribute('style') ? navToggleBtn.getAttribute('style') : '' } : null;

let page = 1;

async function loadGitHubTimeline(loadMore = false) {
    // If this page doesn't have a timeline container (e.g., lifestyle.html), no-op.
    if (!timelineContainer) return;
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
            if (timelineContainer) timelineContainer.innerHTML = '<p class="text-center text-gray-500">No public projects found.</p>';
            if (loadingElement) loadingElement.style.display = 'none';
            return;
        }

        if (!loadMore) {
            if (timelineContainer) timelineContainer.innerHTML = '';
        }
        if (loadingElement) loadingElement.style.display = 'none';

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
        if (timelineContainer) timelineContainer.innerHTML = '<p class="text-center text-red-500">Error loading projects.</p>';
        if (loadingElement) loadingElement.style.display = 'none';
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

// NOTE: mobile menu behavior is handled by toggling `body.nav-open` (see below).
// The older toggle that flipped a `.nav-menu.active` class was removed to
// avoid conflicting toggles when the nav lives in a full-screen panel.

// Mobile nav: toggling using the new nav-toggle button
if (navToggleBtn && mainNav) {
    // Helper to open mobile nav: move to body, apply inline fixed styles so it fills viewport
    function openMobileNav() {
        try {
            // measure current toggler position so we can pin it visually when moved in the DOM
            let rect = null;
            try { rect = navToggleBtn.getBoundingClientRect(); } catch (e) { rect = null; }

            if (mainNav && mainNav.parentNode !== document.body) document.body.appendChild(mainNav);
            // keep the CSS-controlled frosted background; do not force a white background inline
            if (mainNav) {
                mainNav.style.display = 'block';
                mainNav.style.position = 'fixed';
                mainNav.style.inset = '0';
                mainNav.style.zIndex = '120';
                mainNav.style.padding = '28px 20px 20px 20px';
                mainNav.style.overflow = 'auto';
            }
            document.body.classList.add('nav-open');
            navToggleBtn.setAttribute('aria-expanded', 'true');
            navToggleBtn.setAttribute('aria-label', 'Close menu');
            // move the toggler into the root-level container so it sits above overlays
            try {
                const root = document.getElementById('root-togglers');
                if (root && navToggleBtn && navToggleBtn.parentNode !== root) {
                    // Apply inline fixed positioning to keep visual continuity while the button is moved
                    if (rect && rect.width && rect.height) {
                        // pin it to the exact screen coordinates it occupied before moving
                        navToggleBtn.style.position = 'fixed';
                        navToggleBtn.style.top = `${rect.top}px`;
                        navToggleBtn.style.left = `${rect.left}px`;
                        navToggleBtn.style.width = `${rect.width}px`;
                        navToggleBtn.style.height = `${rect.height}px`;
                        navToggleBtn.style.margin = '0';
                        // ensure it's above the panel
                        navToggleBtn.style.zIndex = '170';
                        navToggleBtn.style.transform = 'translateZ(0)';
                    }
                    root.appendChild(navToggleBtn);
                }
            } catch (e) { /* ignore */ }
            // toggler fixed positioning is handled by CSS (body.nav-open .nav-toggle)
            // move focus to first link and trap
            focusFirstNavLink();
            trapNavFocus();
        } catch (e) {
            console.warn('openMobileNav failed', e);
        }
    }

    // Helper to close mobile nav and restore original DOM location and styles
    function closeMobileNav() {
        try {
            document.body.classList.remove('nav-open');
            navToggleBtn.setAttribute('aria-expanded', 'false');
            navToggleBtn.setAttribute('aria-label', 'Open menu');
            // restore inline styles
            if (mainNav) {
                mainNav.style.display = '';
                mainNav.style.position = '';
                mainNav.style.inset = '';
                mainNav.style.zIndex = '';
                mainNav.style.background = '';
                mainNav.style.padding = '';
                mainNav.style.overflow = '';
            }
            // restore toggler to its original DOM location
            try {
                const root = document.getElementById('root-togglers');
                if (root && _togglerOriginal && _togglerOriginal.parent) {
                    const parent = _togglerOriginal.parent;
                    const next = _togglerOriginal.nextSibling;
                    if (next) parent.insertBefore(navToggleBtn, next); else parent.appendChild(navToggleBtn);
                    // restore original inline style (if any) so position/size go back to normal
                    try {
                        if (_togglerOriginal.inlineStyle && _togglerOriginal.inlineStyle.length) navToggleBtn.setAttribute('style', _togglerOriginal.inlineStyle); else navToggleBtn.removeAttribute('style');
                    } catch (e) { /* ignore */ }
                }
            } catch (e) { /* ignore */ }
            // restore to original place if available
            if (_navOriginal && _navOriginal.parent) {
                const parent = _navOriginal.parent;
                const next = _navOriginal.nextSibling;
                if (next) parent.insertBefore(mainNav, next); else parent.appendChild(mainNav);
            }
            releaseNavFocus();
            if (navToggleBtn) navToggleBtn.focus();
        } catch (e) {
            console.warn('closeMobileNav failed', e);
        }
    }

    // Toggle handler uses helpers
    navToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('nav-open')) closeMobileNav(); else openMobileNav();
    });

    // Close nav when a link inside it is clicked
    mainNav.addEventListener('click', (e) => {
        const a = e.target.closest && e.target.closest('a');
        if (!a) return;
        // allow normal click; then close nav and return focus to the toggler
        closeMobileNav();
    });

    // Close nav on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
            closeMobileNav();
        }
    });
}

// When nav opens, move focus to the first link and listen for the close button
function focusFirstNavLink() {
    if (!mainNav) return;
    const firstLink = mainNav.querySelector('.nav-list a');
    if (firstLink) firstLink.focus();
}

// Observe body class changes to detect nav-open (fallback for simple toggle)
const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
            const opened = document.body.classList.contains('nav-open');
            if (opened) focusFirstNavLink();
        }
    }
});
observer.observe(document.body, { attributes: true });

// Handle explicit nav-close button(s)
document.querySelectorAll('#main-nav .nav-close').forEach(btn => {
    btn.addEventListener('click', () => {
        closeMobileNav();
    });
});

// Simple focus trap for the nav panel
let _navTrapHandler = null;
function trapNavFocus() {
    if (!mainNav) return;
    const nodes = Array.from(mainNav.querySelectorAll('a, button')).filter(el => el.offsetParent !== null);
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    _navTrapHandler = function(e) {
        if (e.key !== 'Tab') return;
        const active = document.activeElement;
        if (e.shiftKey) {
            if (active === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (active === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };
    document.addEventListener('keydown', _navTrapHandler);
}

function releaseNavFocus() {
    if (_navTrapHandler) document.removeEventListener('keydown', _navTrapHandler);
    _navTrapHandler = null;
}

// Hook into mutation observer to trap/release focus when nav opens/closes
const bodyClassObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
            const opened = document.body.classList.contains('nav-open');
            if (opened) {
                focusFirstNavLink();
                trapNavFocus();
            } else {
                releaseNavFocus();
            }
        }
    }
});
bodyClassObserver.observe(document.body, { attributes: true });

// About modal handlers
function openModal() {
    if (!aboutModal) return;
    // mark modal as open and let CSS animate (blur + opacity)
    aboutModal.setAttribute('aria-hidden', 'false');
    aboutModal.classList.add('is-open');
    // small delay so the browser can apply the 'is-open' state, then flip active for transitions
    requestAnimationFrame(() => requestAnimationFrame(() => aboutModal.classList.add('is-active')));
    // lock scroll on both <html> and <body> so the page cannot scroll behind the modal
    document.body.classList.add('modal-open');
    try { document.documentElement.classList.add('modal-open'); } catch (e) {}
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
    try { document.documentElement.classList.remove('modal-open'); } catch (e) {}
}

// Site Data modal handlers (reuse About modal behavior)
function openSiteData() {
    if (!siteDataModal) return;
    siteDataModal.setAttribute('aria-hidden', 'false');
    siteDataModal.classList.add('is-open');
    requestAnimationFrame(() => requestAnimationFrame(() => siteDataModal.classList.add('is-active')));
    // lock scroll on both root and body
    document.body.classList.add('modal-open');
    try { document.documentElement.classList.add('modal-open'); } catch (e) {}
    // refresh displayed visit count when opening
    (async () => {
        const v = await fetchVisitCount();
        updateVisitElement(v);
        // also refresh the GitHub Pages badge in the injected modal and update timestamp
        await updateGithubPagesBadge();
        try { refreshSitePerformance(); initPerfSampleButton(); } catch (e) {}
    })();
    // refresh GitHub Pages badge on open (legacy call)
    updateGithubPagesBadge();
    try { refreshSitePerformance(); initPerfSampleButton(); } catch (e) {}
}

function closeSiteData() {
    if (!siteDataModal) return;
    siteDataModal.classList.remove('is-active');
    siteDataModal.classList.remove('is-open');
    siteDataModal.classList.remove('is-closing');
    siteDataModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    try { document.documentElement.classList.remove('modal-open'); } catch (e) {}
}

/* Strava embed: fullscreen expand behavior
   Adds a small control to expand the standalone embed to a fixed, viewport-sized overlay so the
   third-party iframe can render without inner scrollbars. */
function initStravaExpand() {
    const stands = Array.from(document.querySelectorAll('.strava-standalone'));
    if (stands.length === 0) return;

    // Helper to lazy-load the external script once
    function ensureStravaScript() {
        if (window.__strava_embed_loaded) return Promise.resolve();
        return new Promise((resolve) => {
            const s = document.createElement('script');
            s.src = 'https://strava-embeds.com/embed.js';
            s.async = true;
            s.onload = () => { window.__strava_embed_loaded = true; resolve(); };
            s.onerror = () => { resolve(); };
            document.body.appendChild(s);
        });
    }

    stands.forEach((stand) => {
        const btn = stand.querySelector('.strava-expand-btn');
        const host = stand.querySelector('#strava-embed, .strava-embed-container');
        if (!btn || !host) return;

        let opened = false;

        const closeBtn = stand.querySelector('.strava-close-btn');

        async function openFull() {
            stand.classList.add('is-fullscreen');
            btn.setAttribute('aria-expanded', 'true');
            if (closeBtn) closeBtn.setAttribute('aria-hidden', 'false');
            // reveal embed container
            host.setAttribute('aria-hidden', 'false');
            // lazy-load script
            await ensureStravaScript();
            opened = true;
            // focus the close button for accessibility if present, otherwise the expand button
            if (closeBtn) closeBtn.focus(); else btn.focus();
            // mark body to hide decorative header pill and dim background if desired
            document.body.classList.add('embed-open');
            document.body.style.overflow = 'hidden';
        }

        function closeFull() {
            stand.classList.remove('is-fullscreen');
            btn.setAttribute('aria-expanded', 'false');
            if (closeBtn) closeBtn.setAttribute('aria-hidden', 'true');
            host.setAttribute('aria-hidden', 'true');
            opened = false;
            document.body.style.overflow = '';
            // return focus to the expand button and remove embed-open marker
            btn.focus();
            document.body.classList.remove('embed-open');
            // blur the close button to avoid a lingering focus/selection visual on some platforms
            try { if (closeBtn && typeof closeBtn.blur === 'function') closeBtn.blur(); } catch (e) {}
        }

        btn.addEventListener('click', () => {
            if (opened) closeFull(); else openFull();
        });

        if (closeBtn) {
            // close button inside the overlay
            closeBtn.addEventListener('click', () => {
                if (opened) closeFull();
            });
            // ensure it's hidden until opened
            closeBtn.setAttribute('aria-hidden', 'true');
            // prevent pointerdown from focusing the button on touch devices which can leave a persistent
            // pressed/focus visual in some browsers; we still allow click to close
            closeBtn.addEventListener('pointerdown', (ev) => {
                try { ev.preventDefault(); } catch (e) {}
            });
        }

        // Close this stand's fullscreen on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && stand.classList.contains('is-fullscreen')) closeFull();
        });
    });
}

// Initialize after DOM loads
window.addEventListener('load', () => {
    initStravaExpand();
});

/* After the Strava script injects markup, try to find the activity title and copy it into
   the `.strava-title` element so the summary shows the real title. This uses a MutationObserver
   to avoid polling and gracefully no-ops if the structure is unexpected. */
function initStravaTitleSync() {
    const stands = Array.from(document.querySelectorAll('.strava-standalone'));
    if (stands.length === 0) return;

    stands.forEach((stand, idx) => {
        const host = stand.querySelector('#strava-embed, #strava-embed-2, .strava-embed-container');
        const titleEl = stand.querySelector('.strava-title');
        if (!host || !titleEl) return;

        const mo = new MutationObserver((mutations, obs) => {
            const candidate = host.querySelector('h1.activity-name, h2.activity-name, h2, h3, .activity-title, .strava-activity-title');
            if (candidate && candidate.textContent && candidate.textContent.trim().length > 0) {
                let text = candidate.textContent.trim();
                // If the title already contains an emoji at start, keep it.
                const emojiStart = /^\p{Extended_Pictographic}/u.test(text);
                if (!emojiStart) {
                    const lower = text.toLowerCase();
                    if (lower.includes('ride') || lower.includes('cycling') || lower.includes('bike')) text = '🚴 ' + text;
                    else if (lower.includes('run') || lower.includes('jog') || lower.includes('marathon')) text = '🏃 ' + text;
                    else if (lower.includes('swim')) text = '🏊 ' + text;
                    else text = '⭐ ' + text;
                }
                titleEl.textContent = text;
                obs.disconnect();
            }
        });

        mo.observe(host, { childList: true, subtree: true });
    });
}

window.addEventListener('load', () => initStravaTitleSync());

/* Sync distance / elevation / time from injected embed into the summary stats.
   Uses heuristics to find text nodes that match typical formats (e.g. "103.9 mi", "4,836 ft", "6h 21m").
   Falls back gracefully if specific values aren't found. */
function initStravaStatsSync() {
    const stands = Array.from(document.querySelectorAll('.strava-standalone'));
    if (stands.length === 0) return;

    const distanceRe = /([0-9]{1,3}(?:[.,][0-9]+)?)\s*(mi|km)\b/i;
    const elevRe = /([0-9]{1,3}(?:[,][0-9]{3})*|[0-9]+)\s*(ft|m|meters|metres)\b/i;
    const timeRe = /(?:(\d+)h\s*(\d+)m)|(\d+:\d+)|(\d+h)/i;

    stands.forEach((stand) => {
        const host = stand.querySelector('.strava-embed-container');
        const statNums = Array.from(stand.querySelectorAll('.strava-stats .stat .stat-num'));
        if (!host || statNums.length < 3) return;

        const mo = new MutationObserver((mutations, obs) => {
            // First, look for the exact structure you pasted: .stats.activity-stats .stat .stat-value
            const statValues = host.querySelectorAll('.stats.activity-stats .stat .stat-value, .activity-stats .stat .stat-value');
            if (statValues && statValues.length >= 3) {
                try {
                    const d = statValues[0].textContent.trim();
                    const e = statValues[1].textContent.trim();
                    const t = statValues[2].textContent.trim();
                    if (d) statNums[0].textContent = d;
                    if (e) statNums[1].textContent = e;
                    if (t) statNums[2].textContent = t;
                    obs.disconnect();
                    return;
                } catch (err) {
                    // fall through to generic scanning on error
                }
            }

            // search elements under host for candidates (generic fallback)
            const walker = document.createTreeWalker(host, NodeFilter.SHOW_ELEMENT, null);
            let node;
            let foundDistance = null;
            let foundElev = null;
            let foundTime = null;

            while ((node = walker.nextNode())) {
                const text = (node.textContent || '').trim();
                if (!text) continue;
                // distance
                if (!foundDistance) {
                    const m = text.match(distanceRe);
                    if (m) foundDistance = m[1].replace(',', '.').trim() + ' ' + m[2];
                }
                // elevation
                if (!foundElev) {
                    const m = text.match(elevRe);
                    if (m) foundElev = m[1].trim() + ' ' + (m[2] || 'ft');
                }
                // time
                if (!foundTime) {
                    const m = text.match(timeRe);
                    if (m) {
                        if (m[1] && m[2]) foundTime = `${m[1]}h ${m[2]}m`;
                        else if (m[3]) foundTime = m[3];
                        else if (m[4]) foundTime = `${m[4]}`;
                    }
                }
                if (foundDistance && foundElev && foundTime) break;
            }

            // Apply found values to the stat-num elements (distance, elev, time)
            if (foundDistance) statNums[0].textContent = foundDistance.replace(/\s+mi/i, ' mi').replace(/\s+km/i, ' km');
            if (foundElev) statNums[1].textContent = foundElev.replace(/meters?/i, 'm');
            if (foundTime) statNums[2].textContent = foundTime;

            // If we've found at least one value, disconnect to avoid extra work; otherwise keep observing until timeout
            if (foundDistance || foundElev || foundTime) obs.disconnect();
        });

        mo.observe(host, { childList: true, subtree: true });
    });
}

window.addEventListener('load', () => initStravaStatsSync());

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
    // lock scroll on both root and body
    document.body.classList.add('modal-open');
    try { document.documentElement.classList.add('modal-open'); } catch (e) {}
}

function closeContact() {
    if (!contactModal) return;
    contactModal.classList.remove('is-active');
    contactModal.classList.remove('is-open');
    contactModal.classList.remove('is-closing');
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    try { document.documentElement.classList.remove('modal-open'); } catch (e) {}
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

if (siteDataLink && siteDataModal) {
    siteDataLink.addEventListener('click', (e) => {
        e.preventDefault();
        openSiteData();
    });

    siteDataModal.addEventListener('click', (e) => {
        const close = e.target && e.target.getAttribute && e.target.getAttribute('data-close');
        if (close) closeSiteData();
    });

    const closeBtnSite = siteDataModal.querySelector('.modal-close');
    if (closeBtnSite) closeBtnSite.addEventListener('click', closeSiteData);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSiteData();
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

document.addEventListener('DOMContentLoaded', () => { if (timelineContainer) loadGitHubTimeline(); });

// --- Simple site visit counter using CountAPI (no server required)
// Uses CountAPI (https://countapi.xyz) to increment a namespaced counter and display it.
const COUNTAPI_NAMESPACE = 'brayanvillatoro';
const COUNTAPI_KEY = 'site_visits';

async function fetchVisitCount() {
    try {
        const res = await fetch(`https://api.countapi.xyz/get/${COUNTAPI_NAMESPACE}/${COUNTAPI_KEY}`);
        if (!res.ok) {
            console.warn('fetchVisitCount: non-OK response', res.status);
            return null;
        }
        const json = await res.json();
        if (!json || typeof json.value === 'undefined') {
            console.warn('fetchVisitCount: unexpected JSON', json);
            return null;
        }
    // cache last-known public value locally for UI fallback
    try { localStorage.setItem('bv_site_visits_public', String(json.value)); } catch (e) {}
    try { const t = document.getElementById('site-visits-checked'); if (t) t.textContent = 'Last checked: ' + new Date().toLocaleString(); } catch (e) {}
        return json.value;
    } catch (e) {
        console.warn('fetchVisitCount failed', e);
        return null;
    }
}

async function incrementVisitCount() {
    try {
        // If the throttle cookie exists, don't increment; just return the current value
        if (getCookie('bv_site_visit')) {
            return await fetchVisitCount();
        }

        const res = await fetch(`https://api.countapi.xyz/hit/${COUNTAPI_NAMESPACE}/${COUNTAPI_KEY}`);
        if (!res.ok) return null;
        const json = await res.json();
        // set a cookie to throttle further increments for 24 hours
    setCookie('bv_site_visit', '1', 1);
    try { localStorage.setItem('bv_site_visits_public', String(json.value)); } catch (e) {}
    try { const t = document.getElementById('site-visits-checked'); if (t) t.textContent = 'Last checked: ' + new Date().toLocaleString(); } catch (e) {}
    return json.value;
    } catch (e) {
        console.warn('incrementVisitCount failed', e);
        // as a graceful fallback, try to return any cached public value
        try {
            const cached = localStorage.getItem('bv_site_visits_public');
            if (cached) return Number(cached);
        } catch (err) {}
        return null;
    }
}

// Cookie helpers: simple, minimal, 1-day expiry helper
function setCookie(name, value, days) {
    try {
        const d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        const expires = `; expires=${d.toUTCString()}`;
        // Add Secure attribute when on HTTPS to ensure cookies are accepted by modern browsers
        const secure = (location && location.protocol === 'https:') ? '; Secure' : '';
        document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax${secure}`;
    } catch (e) {}
}

function getCookie(name) {
    try {
        const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return v ? v.pop() : null;
    } catch (e) { return null; }
}

// Update the visible counter element if present
function updateVisitElement(val) {
    try {
        const el = document.getElementById('site-visits-count');
        if (!el) return;
        if (val === null || typeof val === 'undefined') {
            // try cached public value
            try {
                const cached = localStorage.getItem('bv_site_visits_public');
                if (cached) { el.textContent = String(cached); return; }
            } catch (e) {}
            el.textContent = '—';
        } else el.textContent = String(val);
    } catch (e) { /* ignore */ }
}

// Increment on page load (counts unique page loads) and update display
window.addEventListener('load', async () => {
    const v = await incrementVisitCount();
    updateVisitElement(v);
});

// Like feature removed per user request.

// --- GitHub Pages status via githubstatus.com
const GITHUB_STATUS_URL = 'https://www.githubstatus.com/api/v2/summary.json';
const GITHUB_STATUS_POLL_MS = 4 * 60 * 1000; // 4 minutes
const STATUS_LABELS = {
    operational: 'Operational',
    degraded_performance: 'Degraded',
    partial_outage: 'Partial outage',
    major_outage: 'Major outage',
    under_maintenance: 'Maintenance'
};

async function fetchGithubPagesStatus() {
    try {
        const res = await fetch(GITHUB_STATUS_URL, { cache: 'no-cache' });
        if (!res.ok) throw new Error('Status API ' + res.status);
        const json = await res.json();
        const components = json.components || [];
        const pagesComp = components.find(c => (c.slug && c.slug.toLowerCase().includes('pages')) || (c.name && c.name.toLowerCase().includes('pages')));
        if (!pagesComp) return null;
        return { status: pagesComp.status, name: pagesComp.name };
    } catch (e) {
        console.warn('Failed to fetch GitHub status', e);
        return null;
    }
}

async function updateGithubPagesBadge() {
    const el = document.getElementById('github-pages-status');
    if (!el) return;
    el.textContent = 'Loading…';
    el.className = 'status-badge';

    const info = await fetchGithubPagesStatus();
    if (!info) {
        el.textContent = 'Unknown';
        el.classList.add('status-degraded_performance');
        // update last-checked timestamp
        const tEl = document.getElementById('github-pages-checked');
        if (tEl) tEl.textContent = 'Last checked: ' + new Date().toLocaleString();
        return;
    }

    const s = info.status || 'operational';
    const label = STATUS_LABELS[s] || s;
    el.textContent = label;
    el.className = 'status-badge status-' + s;
    // update last-checked timestamp
    const tEl = document.getElementById('github-pages-checked');
    if (tEl) tEl.textContent = 'Last checked: ' + new Date().toLocaleString();
}

// start polling and update when modal is opened/injected
updateGithubPagesBadge();
setInterval(updateGithubPagesBadge, GITHUB_STATUS_POLL_MS);

// --- Performance (RUM) measurements and browser/device info
let lastLCP = null;
function initPerformanceObservers() {
    try {
        // LCP observer
        if ('PerformanceObserver' in window) {
            const lcpObs = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                if (entries && entries.length) lastLCP = entries[entries.length - 1].renderTime || entries[entries.length - 1].startTime;
            });
            try { lcpObs.observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {}

            // FCP observer: fallback to paint entries
            const fcpObs = new PerformanceObserver((entryList) => {});
            try { fcpObs.observe({ type: 'paint', buffered: true }); } catch (e) {}
        }
    } catch (e) { /* ignore */ }
}

function getNavigationTimings() {
    try {
        const nt = performance.getEntriesByType('navigation')[0];
        if (!nt) return null;
        return {
            navTime: Math.round(nt.loadEventEnd - nt.startTime),
            dcl: Math.round(nt.domContentLoadedEventEnd - nt.startTime)
        };
    } catch (e) { return null; }
}

function getFCP() {
    try {
        const paint = performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint');
        return paint ? Math.round(paint.startTime) : null;
    } catch (e) { return null; }
}

function getLCP() {
    return lastLCP ? Math.round(lastLCP) : null;
}

function detectBrowserInfo() {
    try {
        // Prefer User-Agent Client Hints when available for more precise data
        if (navigator.userAgentData) {
            const brands = navigator.userAgentData.brands || navigator.userAgentData.uaList || [];
            const brand = brands.length ? brands[brands.length - 1].brand : 'Browser';
            const browser = brand || 'Browser';
            const os = navigator.userAgentData.platform || 'Unknown OS';
            return { browser, os, ua: navigator.userAgent || '' };
        }

        const ua = navigator.userAgent || navigator.vendor || window.opera || '';
        let browser = 'Unknown browser';
        if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
        else if (ua.indexOf('Edg/') !== -1) browser = 'Edge';
        else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
        else if (ua.indexOf('Safari') !== -1) browser = 'Safari';

        let os = 'Unknown OS';
        if (ua.indexOf('Windows') !== -1) os = 'Windows';
        else if (ua.indexOf('Macintosh') !== -1) os = 'macOS';
        else if (ua.indexOf('Linux') !== -1) os = 'Linux';
        else if (/Android/.test(ua)) os = 'Android';
        else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';

        return { browser, os, ua };
    } catch (e) { return { browser: 'Unknown', os: 'Unknown', ua: '' }; }
}

// Format ms into human-friendly seconds with 1 decimal (e.g., 900 -> 0.9s)
function fmtTimeMs(ms) {
    if (ms === null || typeof ms === 'undefined' || isNaN(ms)) return '—';
    const s = ms / 1000;
    if (s < 1) return `${s.toFixed(2)}s`;
    return `${s.toFixed(1)}s`;
}

// Prepare an anonymous sample payload (no PII): timings + browser info + timestamp
function buildPerfSample() {
    const nav = getNavigationTimings() || {};
    const sample = {
        timestamp: new Date().toISOString(),
        navTimeMs: nav.navTime || null,
        dclMs: nav.dcl || null,
        fcpMs: getFCP() || null,
        lcpMs: getLCP() || null,
        browser: detectBrowserInfo().browser,
        os: detectBrowserInfo().os
    };
    return sample;
}

// Wire the sample button: copy JSON to clipboard and show a status message
function initPerfSampleButton() {
    const btn = document.getElementById('perf-sample-btn');
    const status = document.getElementById('perf-sample-status');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        try {
            const payload = buildPerfSample();
            const json = JSON.stringify(payload);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(json);
                if (status) status.textContent = 'Sample copied to clipboard (anonymous)';
            } else {
                // fallback: open window with raw JSON so user can copy
                const w = window.open();
                w.document.body.innerText = json;
                if (status) status.textContent = 'Sample opened in new window (copy to share)';
            }
            setTimeout(() => { if (status) status.textContent = ''; }, 5000);
        } catch (e) {
            if (status) status.textContent = 'Failed to prepare sample';
            setTimeout(() => { if (status) status.textContent = ''; }, 3000);
        }
    });
}

function updatePerformanceUI() {
    try {
        const nav = getNavigationTimings();
        const fcp = getFCP();
        const lcp = getLCP();
        if (nav) {
            const navEl = document.getElementById('perf-navtime'); if (navEl) navEl.textContent = nav.navTime;
            const dclEl = document.getElementById('perf-dcl'); if (dclEl) dclEl.textContent = nav.dcl;
        }
        const fcpEl = document.getElementById('perf-fcp'); if (fcpEl) fcpEl.textContent = fcp || '—';
        const lcpEl = document.getElementById('perf-lcp'); if (lcpEl) lcpEl.textContent = lcp || '—';

        const info = detectBrowserInfo();
        const bEl = document.getElementById('browser-info'); if (bEl) bEl.textContent = `${info.browser} on ${info.os}`;
    } catch (e) { /* ignore */ }
}

// Initialize observers early so paint/LCP are captured
initPerformanceObservers();

// Update performance UI when modal is injected or opened
function refreshSitePerformance() {
    // update immediately from existing metrics
    updatePerformanceUI();
    // schedule a small delayed update to allow late paint entries
    setTimeout(updatePerformanceUI, 1200);
}

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
            // Place the toggle next to the dates on the same row. Create or reuse a .job-meta container
            const role = job.querySelector('.job-role');
            const dates = role ? role.querySelector('.job-dates') : null;
            let meta = job.querySelector('.job-meta');
            try {
                if (!meta) {
                    meta = document.createElement('div');
                    meta.className = 'job-meta';
                }

                if (dates) {
                    // Move dates into meta if not already inside it
                    if (dates.parentNode !== meta) meta.appendChild(dates);
                }

                // Append the toggle into meta and then place meta into job-role (or head)
                meta.appendChild(btn);
                if (role) role.appendChild(meta); else head.appendChild(meta);
            } catch (e) {
                // fallback: insert after head
                head.insertAdjacentElement('afterend', btn);
            }
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

// Note: Strava embeds removed; no normalization required.

// Sticky header helper: measure header height and set CSS variable for mobile
function setHeaderOffset() {
    try {
        const header = document.querySelector('header');
        if (!header) return;
        const root = document.documentElement;
        const rect = header.getBoundingClientRect();
        const height = Math.ceil(rect.height);
        root.style.setProperty('--header-offset', `${height}px`);

        // add a padding class to main sections so content is pushed below the fixed header
        document.querySelectorAll('body > *').forEach(el => {
            if (el.tagName.toLowerCase() === 'header' || el.tagName.toLowerCase() === 'script') return;
            if (window.innerWidth <= 720) {
                el.classList.add('content-offset');
            } else {
                el.classList.remove('content-offset');
            }
        });
    } catch (e) {
        // ignore
    }
}

window.addEventListener('resize', debounce(setHeaderOffset, 120));
window.addEventListener('orientationchange', debounce(setHeaderOffset, 160));
document.addEventListener('DOMContentLoaded', setHeaderOffset);
window.addEventListener('load', () => setTimeout(setHeaderOffset, 80));

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

    if (a.id === 'site-data-link') {
        e.preventDefault();
        if (!siteDataModal) {
            await fetchModalFromIndex('site-data-modal');
            // after injecting, update the reference and bind
            siteDataModal = document.getElementById('site-data-modal');
            bindModalInteractions(siteDataModal, closeSiteData);
            // update the visit count in the injected modal
            (async () => {
                const v = await fetchVisitCount();
                updateVisitElement(v);
                // update badge and performance UI for injected modal
                await updateGithubPagesBadge();
                try { refreshSitePerformance(); initPerfSampleButton(); } catch (e) {}
            })();
        }

        if (siteDataModal) {
            openSiteData();
            history.replaceState(null, '', '#site-data');
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