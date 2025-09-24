// Replace with your GitHub username
const GITHUB_USERNAME = 'YOUR_GITHUB_USERNAME'; // e.g., 'brayan-villatoro'
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=created&direction=asc&per_page=10`;

// DOM elements
const timelineContainer = document.getElementById('timeline-container');
const loadingElement = document.getElementById('loading');

// Function to fetch and display GitHub projects
async function loadGitHubTimeline() {
    try {
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch GitHub data');
        }
        const repos = await response.json();

        if (repos.length === 0) {
            timelineContainer.innerHTML = '<p>No public projects found. Make sure your repos are public!</p>';
            loadingElement.style.display = 'none';
            return;
        }

        timelineContainer.innerHTML = ''; // Clear loading
        loadingElement.style.display = 'none';

        repos.forEach((repo, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.style.animationDelay = `${index * 0.2}s`; // Staggered animation

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
        timelineContainer.innerHTML = '<p>Error loading projects. Check your username and internet connection.</p>';
        loadingElement.style.display = 'none';
    }
}

// Smooth scrolling for navigation links
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

// Load timeline on page load
document.addEventListener('DOMContentLoaded', loadGitHubTimeline);
