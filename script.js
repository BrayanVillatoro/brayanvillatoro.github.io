const GITHUB_USERNAME = 'brayanvillatoro';
const PROJECTS_PER_PAGE = 6;

const projectsContainer = document.getElementById('projects-container');
const loadingElement = document.getElementById('loading');
const formResponse = document.getElementById('form-response');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

async function loadGitHubProjects() {
    const apiUrl = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=created&direction=desc&per_page=${PROJECTS_PER_PAGE}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch GitHub data');
        }
        const repos = await response.json();

        if (repos.length === 0) {
            projectsContainer.innerHTML = '<p class="text-center">No public projects found.</p>';
            loadingElement.style.display = 'none';
            return;
        }

        loadingElement.style.display = 'none';

        repos.forEach((repo, index) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card animate__animated animate__fadeInUp';
            projectCard.style.animationDelay = `${index * 0.2}s`;

            const createdDate = new Date(repo.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Placeholder image; replace with actual project images if available
            projectCard.innerHTML = `
                <img src="project${index + 1}.jpg" alt="${repo.name}" class="project-img">
                <h3>${repo.name}</h3>
                <p>${repo.description || 'No description available.'}</p>
                <a href="${repo.html_url}" target="_blank">View on GitHub</a>
            `;

            projectsContainer.appendChild(projectCard);
        });

    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        projectsContainer.innerHTML = '<p class="text-center text-red-500">Error loading projects.</p>';
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
        formResponse.classList.add('animate__animated', 'animate__fadeIn');
        form.reset();
    });
}

document.addEventListener('DOMContentLoaded', () => loadGitHubProjects());