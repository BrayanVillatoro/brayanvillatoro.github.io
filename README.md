# Brayan Villatoro's Portfolio 🌟

![brayan_villatoro](https://github.com/user-attachments/assets/cd555f77-2c73-4fbb-88a6-756bbd12a997)

Welcome to my personal portfolio repository! This static website, hosted on **GitHub Pages**, showcases my skills, projects, and professional journey as a full-stack developer. Built with **HTML**, **CSS**, and **JavaScript**, it features a dynamic GitHub projects timeline, a contact form powered by Formspree, and a link to my LinkedIn profile.

🔗 **Live Demo**: [brayanvillatoro.com](https://brayanvillatoro.com)  
📩 **Contact**: [Contact Page](https://brayanvillatoro.com/contact.html)  
💼 **LinkedIn**: [Brayan Villatoro](https://www.linkedin.com/in/brayan-villatoro/)  
⭐ **Star this repo**: Show support by starring!  
🔔 **Watch for updates**: Stay tuned for new features.

[![MIT License](https://img.shields.io/github/license/brayanvillatoro/brayanvillatoro.github.io)](https://github.com/brayanvillatoro/brayanvillatoro.github.io/blob/main/LICENSE)  
[![GitHub Stars](https://img.shields.io/github/stars/brayanvillatoro/brayanvillatoro.github.io)](https://github.com/brayanvillatoro/brayanvillatoro.github.io/stargazers)  
[![Last Commit](https://img.shields.io/github/last-commit/brayanvillatoro/brayanvillatoro.github.io)](https://github.com/brayanvillatoro/brayanvillatoro.github.io/commits/main)

---

## 🚀 Features

- **Dynamic GitHub Timeline**: Fetches my public repositories from the GitHub API, displayed in a responsive, animated timeline sorted by creation date.
- **Responsive Design**: Optimized for all devices with smooth animations via [Animate.css](https://animate.style/).
- **Contact Form**: Powered by [Formspree](https://formspree.io/) for seamless email submissions.
- **Professional Experience Section**: Highlights my experience and skills, synced with my [LinkedIn profile](https://www.linkedin.com/in/brayan-villatoro/).
- **Modern Styling**: Clean gradients, hover effects, and a LinkedIn-inspired blue theme.
- **Lightweight**: No build tools required—pure static files for easy hosting on GitHub Pages.

| Feature | Description |
|---------|-------------|
| **Tech Stack** | HTML, CSS, JavaScript, GitHub API, Animate.css, Font Awesome |
| **Hosting** | GitHub Pages |
| **APIs Used** | GitHub API (public repos), Formspree (contact form) |
| **Animations** | Fade-ins, hover effects, and timeline dot scaling |
| **Accessibility** | Mobile-friendly, smooth scrolling, semantic HTML |

---

## 🛠️ Getting Started

Follow these steps to run the website locally or adapt it for your own use.

### Prerequisites
- A GitHub account
- A text editor (e.g., [VS Code](https://code.visualstudio.com/))
- (Optional) [Formspree](https://formspree.io/) account for the contact form

### Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/brayanvillatoro/brayanvillatoro.github.io.git
   cd brayanvillatoro.github.io
   ```

2. **Preview Locally**:
   - Open `index.html` in a browser to view the site.
   - No server or build tools needed—it's fully static.

3. **Customize**:
   - **GitHub Username**: The `script.js` is set to fetch repos for `brayanvillatoro`. To use another username, update:
     ```javascript
     const GITHUB_USERNAME = 'your-username';
     ```
   - **Formspree Endpoint**: In `contact.html`, replace the Formspree URL with your own:
     ```html
     <form action="https://formspree.io/f/YOUR_FORMSPREE_HASH" method="POST">
     ```
     - Sign up at [formspree.io](https://formspree.io/), create a form, and copy the endpoint hash.
   - **Experience Section**: Edit `index.html` to update experience and skills from your LinkedIn.
   - **Styling**: Modify `styles.css` for custom colors or layouts.

4. **Deploy**:
   - Commit changes:
     ```bash
     git add .
     git commit -m "Customize portfolio"
     git push origin main
     ```
   - Enable GitHub Pages in your repo settings:
     - Go to Settings > Pages.
     - Set Source to `main` branch, folder `/ (root)`.
   - Visit [https://brayanvillatoro.github.io](https://brayanvillatoro.github.io) to see your live site (may take a few minutes to propagate).

---

## 📂 Project Structure

```
brayanvillatoro.github.io/
├── index.html        # Homepage with Experience and GitHub timeline
├── contact.html      # Contact form page
├── styles.css        # Global styles with responsive design
├── script.js         # GitHub API fetch, smooth scrolling, form response
├── liftstyle.html    # My life
├── Images            # Collection of images for the website
└── README.md         # This file
```

---

## 🤝 Contributing

I welcome contributions to enhance this website! To contribute:

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-idea`.
3. Commit changes: `git commit -m "Add your feature"`.
4. Push to the branch: `git push origin feature/your-idea`.
5. Open a pull request.

Please include a clear description of your changes. If you find bugs or have suggestions, open an issue first. Follow the [Code of Conduct](CODE_OF_CONDUCT.md) (add one if needed).

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Font Awesome](https://fontawesome.com/)**: For icons in navigation and LinkedIn button.
- **[Animate.css](https://animate.style/)**: For smooth animations.
- **[Formspree](https://formspree.io/)**: For contact form functionality.
- **[GitHub API](https://docs.github.com/en/rest)**: For dynamic project data.

---

## 📬 Stay Connected

- ⭐ **Star this repo** to show support!
- 🔔 **Watch** for updates on new features and fixes.
- 💬 Join the conversation in the [Discussions](https://github.com/brayanvillatoro/brayanvillatoro.github.io/discussions) tab.
- 📧 Reach out via the [Contact Page](https://brayanvillatoro.com/contact.html) or [LinkedIn](https://www.linkedin.com/in/brayan-villatoro/).

Thank you for visiting my portfolio! 🚀 Let's connect and build something amazing.

---

© 2025 Brayan Villatoro
