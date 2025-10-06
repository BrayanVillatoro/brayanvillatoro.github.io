const GITHUB_USERNAME = 'brayanvillatoro';
const MOBILE_BREAKPOINT = 768;
const REPOS_PER_PAGE_MOBILE = 5;
const REPOS_PER_PAGE_DESKTOP = 10;

const timelineContainer = document.getElementById('timeline-container');
const loadingElement = document.getElementById('loading');
const formResponse = document.getElementById('form-response');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

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
            const timelineItem = document.createElement('div');
            timelineItem.className = `timeline-item animate__animated animate__fadeInUp`;
            timelineItem.style.animationDelay = `${index * 0.2}s`;

            const createdDate = new Date(repo.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            timelineItem.innerHTML = `
                <div class="timeline-content">
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description available.'}</p>
                    <span>Created: ${createdDate} | Language: ${repo.language || 'Not specified'}</span><br>
                    <a href="${repo.html_url}" target="_blank" class="project-link">View on GitHub</a>
                </div>
            `;

            timelineContainer.appendChild(timelineItem);
        });

        // Add Load More button only on mobile and if more repos exist
        if (isMobile && repos.length === REPOS_PER_PAGE_MOBILE) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.className = 'load-more-btn';
            loadMoreBtn.onclick = () => {
                page++;
                loadGitHubTimeline(true);
                loadMoreBtn.remove();
            };
            timelineContainer.appendChild(loadMoreBtn);
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

// Mobile menu toggle
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Form response handling
if (formResponse) {
    const form = document.querySelector('.contact-form');
    form.addEventListener('submit', function (e) {
        formResponse.textContent = 'Thanks for your message! I’ll get back soon.';
        form.reset();
    });
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