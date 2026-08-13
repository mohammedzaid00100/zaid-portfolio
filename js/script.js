const state = {
  projects: [],
  activeFilter: 'all',
  activeProject: null,
  activeScreenshot: 0,
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const projectGrid = $('#projectGrid');
const projectsEmpty = $('#projectsEmpty');
const modal = $('#projectModal');
const modalImage = $('#modalImage');
const modalDots = $('#modalDots');

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('zaid-theme', theme);
  const icon = $('#themeToggle span');
  const button = $('#themeToggle');
  const next = theme === 'dark' ? 'light' : 'dark';
  if (icon) icon.textContent = theme === 'dark' ? '☼' : '☾';
  button?.setAttribute('aria-label', `Switch to ${next} theme`);
  button?.setAttribute('title', `Switch to ${next} theme`);
}

function initTheme() {
  const stored = localStorage.getItem('zaid-theme');
  const fallback = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  setTheme(stored || fallback);
  $('#themeToggle')?.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
}

function cardMarkup(project) {
  const tech = project.tech.map((item) => `<span class="tech-tag">${item}</span>`).join('');
  const features = project.features.slice(0, 4).map((item) => `<li>${item}</li>`).join('');
  const featuredClass = project.featured ? ' project-card-featured' : ' project-card-secondary';
  const featuredBadge = project.featured ? '<span class="project-badge">Priority project</span>' : '<span class="project-badge project-badge-muted">Archived</span>';
  const liveLink = project.demoUrl ? `<a class="project-live-link" href="${project.demoUrl}" target="_blank" rel="noopener noreferrer">TimeDesk Live Demo <span aria-hidden="true">↗</span></a>` : '';
  return `
    <article class="project-card glass${featuredClass}">
      <div class="project-media">
        <img src="${project.screenshots[0].src}" alt="${project.screenshots[0].alt}" loading="lazy">
      </div>
      <div class="project-body">
        <div class="project-title-row">
          <div>
            <p class="eyebrow">${project.category}</p>
            <h3>${project.name}</h3>
          </div>
          ${featuredBadge}
        </div>
        <p>${project.description}</p>
        <div>
          <p class="mini-label">Tech used</p>
          <div class="tech-list" aria-label="Technology used">${tech}</div>
        </div>
        <div>
          <p class="mini-label">What it does</p>
          <p>${project.whatItDoes}</p>
        </div>
        <div>
          <p class="mini-label">Key features</p>
          <ul class="project-highlights">${features}</ul>
        </div>
        <div class="project-meta-copy">
          <div><strong>AI role:</strong> ${project.aiRole}</div>
          <div><strong>Impact & status:</strong> ${project.impact}</div>
        </div>
        <div class="project-footer">
          <span class="status">${project.statusLabel}</span>
          <div class="project-actions">
            ${liveLink}
            <button class="project-open" type="button" data-project-id="${project.id}" aria-label="View details for ${project.name}">${project.featured ? 'Open project →' : 'View details →'}</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function matchesFilter(project, filter) {
  if (filter === 'all') return true;
  const tech = project.tech.join(' ').toLowerCase();
  if (filter === 'javascript') return tech.includes('javascript');
  if (filter === 'react') return tech.includes('react');
  if (filter === 'node') return tech.includes('node.js');
  if (filter === 'pwa') return project.tags.includes('pwa');
  return true;
}

function renderProjects() {
  const visible = state.projects.filter((project) => matchesFilter(project, state.activeFilter));
  projectGrid.innerHTML = visible.map(cardMarkup).join('');
  projectsEmpty.hidden = visible.length !== 0;
}

function renderModalDots(project) {
  modalDots.innerHTML = project.screenshots.map((_, index) => `
    <button class="modal-dot ${index === state.activeScreenshot ? 'active' : ''}" type="button" data-shot-index="${index}" aria-label="Show screenshot ${index + 1}"></button>
  `).join('');
}

function updateModalScreenshot() {
  const project = state.activeProject;
  if (!project) return;
  const shot = project.screenshots[state.activeScreenshot];
  modalImage.src = shot.src;
  modalImage.alt = shot.alt;
  renderModalDots(project);
}

function openProject(id) {
  const project = state.projects.find((item) => item.id === id);
  if (!project) return;
  state.activeProject = project;
  state.activeScreenshot = 0;
  $('#modalCategory').textContent = project.category;
  $('#modalTitle').textContent = project.name;
  $('#modalDescription').textContent = project.description;
  $('#modalTech').innerHTML = project.tech.map((item) => `<span class="tech-tag">${item}</span>`).join('');
  $('#modalFeatures').innerHTML = project.features.map((item) => `<li>${item}</li>`).join('');
  $('#modalAiRole').textContent = project.aiRole;
  $('#modalImpact').textContent = project.impact;
  $('#modalReadmeTitle').textContent = project.readmeTitle || 'Project README';
  const readme = $('#modalReadme');
  readme.innerHTML = (project.readmeSections || []).map((section) => {
    const items = section.items ? `<ul>${section.items.map((item) => `<li>${item}</li>`).join('')}</ul>` : '';
    const text = section.text ? `<p>${section.text}</p>` : '';
    return `<section class="readme-section"><h4>${section.heading}</h4>${text}${items}</section>`;
  }).join('');
  const demo = $('#modalDemo');
  const github = $('#modalGithub');
  demo.href = project.demoUrl || '#';
  demo.innerHTML = project.id === 'timedesk' ? 'TimeDesk Live Demo <span aria-hidden="true">↗</span>' : 'Live demo <span aria-hidden="true">↗</span>';
  github.href = project.githubUrl || '#';
  demo.style.display = project.demoUrl ? 'inline-flex' : 'none';
  github.style.display = project.githubUrl ? 'inline-flex' : 'none';
  updateModalScreenshot();
  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }
  document.body.classList.add('modal-open');
}

function closeProject() {
  if (modal.open && typeof modal.close === 'function') modal.close();
  else modal.removeAttribute('open');
  document.body.classList.remove('modal-open');
}

function initProjectInteractions() {
  projectGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-project-id]');
    if (button) openProject(button.dataset.projectId);
  });

  modalDots.addEventListener('click', (event) => {
    const dot = event.target.closest('[data-shot-index]');
    if (!dot) return;
    state.activeScreenshot = Number(dot.dataset.shotIndex);
    updateModalScreenshot();
  });

  $('#modalClose')?.addEventListener('click', closeProject);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeProject();
  });
  modal?.addEventListener('close', () => document.body.classList.remove('modal-open'));

  $$('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('.filter-chip').forEach((item) => item.classList.remove('active'));
      chip.classList.add('active');
      state.activeFilter = chip.dataset.filter;
      renderProjects();
    });
  });
}

function validateField(field, errorNode, message) {
  const valid = field.checkValidity();
  field.setAttribute('aria-invalid', String(!valid));
  errorNode.textContent = valid ? '' : message;
  return valid;
}

function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;
  const name = $('#name');
  const email = $('#email');
  const message = $('#message');
  const nameError = $('#nameError');
  const emailError = $('#emailError');
  const messageError = $('#messageError');
  const success = $('#formSuccess');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    success.hidden = true;
    const goodName = validateField(name, nameError, 'Please enter at least 2 characters.');
    const goodEmail = validateField(email, emailError, 'Please enter a valid email address.');
    const goodMessage = validateField(message, messageError, 'Please enter at least 10 characters.');
    if (!(goodName && goodEmail && goodMessage)) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const originalLabel = submitButton?.innerHTML || '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = 'Sending…';
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Form submission failed.');

      form.reset();
      [name, email, message].forEach((field) => field.removeAttribute('aria-invalid'));
      success.textContent = 'Thanks for reaching out. Your message has been received.';
      success.hidden = false;
    } catch (error) {
      success.textContent = 'Sorry, your message could not be sent right now. Please email me directly at mohammedzaid00100@gmail.com.';
      success.hidden = false;
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalLabel;
      }
    }
  });
}

function initNavigation() {
  const menuToggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  if (!menuToggle || !mobileMenu) return;
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    mobileMenu.hidden = open;
    if (!open) mobileMenu.style.display = 'flex';
    else mobileMenu.style.display = '';
  });
  $$('#mobileMenu a').forEach((link) => link.addEventListener('click', () => {
    mobileMenu.hidden = true;
    mobileMenu.style.display = '';
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
}

async function loadProjects() {
  try {
    const response = await fetch('data/projects.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.projects = await response.json();
    renderProjects();
  } catch (error) {
    console.error('Project data failed to load:', error);
    projectGrid.innerHTML = `<p class="empty-state glass">Project data could not be loaded. Preview this site through a local web server instead of opening index.html directly.</p>`;
  }
}

function initFooter() { $('#year').textContent = new Date().getFullYear(); }

function init() {
  initTheme();
  initNavigation();
  initProjectInteractions();
  initContactForm();
  initFooter();
  loadProjects();
  // Touch-friendly browsers do not need extra hover logic; CSS handles the interaction states.
  if (!prefersReducedMotion()) document.body.classList.add('motion-enabled');
}

document.addEventListener('DOMContentLoaded', init);
