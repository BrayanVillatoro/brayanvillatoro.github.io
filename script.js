const GITHUB_USERNAME = 'brayan-villatoro';
const GITHUB_API_URL = `https://api.github.com/users/brayanvillatoro/repos?sort=created&direction=asc&per_page=10.`;

const timelineContainer = document.getElementById('timeline-container');
const loadingElement = document.getElementById('loading');
const formResponse = document.getElementById('form-response');

async function loadGitHubTimeline() {
    try {
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch GitHub data');
        }
        const repos = await response.json();

        if (repos.length === 0) {
            timelineContainer.innerHTML = '<p class="text-center text-gray-500">No public projects found.</p>';
            loadingElement.style.display = 'none';
            return;
        }

        timelineContainer.innerHTML = '';
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

    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        timelineContainer.innerHTML = '<p class="text-center text-red-500">Error loading projects.</p>';
        loadingElement.style.display = 'none';
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

if (formResponse) {
    const form = document.querySelector('.contact-form');
    form.addEventListener('submit', function (e) {
        formResponse.textContent = 'Thanks for your message! I’ll get back soon.';
        form.reset();
    });
}

document.addEventListener('DOMContentLoaded', loadGitHubTimeline);
