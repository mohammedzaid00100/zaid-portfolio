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
  try { localStorage.setItem('zaid-theme', theme); } catch (_) {}
  const icon = $('#themeToggle span');
  const button = $('#themeToggle');
  const next = theme === 'dark' ? 'light' : 'dark';
  if (icon) icon.textContent = theme === 'dark' ? '☼' : '☾';
  button?.setAttribute('aria-label', `Switch to ${next} theme`);
  button?.setAttribute('title', `Switch to ${next} theme`);
}

function initTheme() {
  let stored;
  try { stored = localStorage.getItem('zaid-theme'); } catch (_) {}
  setTheme(['light', 'dark'].includes(stored) ? stored : 'dark');
  $('#themeToggle')?.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function cardMarkup(project) {
  const number = String(state.projects.indexOf(project) + 1).padStart(2, '0');
  const id = escapeHtml(project.id);
  const name = escapeHtml(project.name);
  const title = project.visualLabel.split(' / ').map(part => `<span>${escapeHtml(part)}</span>`).join('');
  const demo = project.demoUrl ? `<a href="${escapeHtml(project.demoUrl)}" target="_blank" rel="noopener noreferrer">${project.id === 'collab-deal-os' ? 'Demo only' : 'Live site'} ↗</a>` : '';
  const features = project.features.slice(0, 3).map(feature => `<li>${escapeHtml(feature)}</li>`).join('');
  return `<article class="project-card" data-expanded="false">
    <button class="project-cover cover-${id}" type="button" data-project-toggle="${id}" aria-expanded="false" aria-controls="project-panel-${id}" aria-label="Toggle details for ${name}">
      <span class="cover-label">PROJECT / ${number}</span><span class="cover-title" aria-hidden="true">${title}</span>
      <span class="cover-bottom"><span>${escapeHtml(project.tech.slice(0,3).join(' / '))}</span><span class="cover-arrow" aria-hidden="true">+</span></span>
    </button>
    <div class="project-body"><div class="project-title-row"><h3 id="project-title-${id}">${name}</h3><span class="status">${escapeHtml(project.statusLabel)}</span></div>
      <button class="project-expand-toggle" type="button" data-project-toggle="${id}" aria-expanded="false" aria-controls="project-panel-${id}"><span class="expand-label">About this project</span><span class="expand-icon" aria-hidden="true">+</span></button>
      <div class="project-expand-panel" id="project-panel-${id}" role="region" aria-labelledby="project-title-${id}" aria-hidden="true" inert>
        <div class="project-expand-clip"><div class="project-expand-content">
          <p class="project-description">${escapeHtml(project.description)}</p>
          <ul class="project-feature-list">${features}</ul>
          <div class="project-footer"><span class="project-category">${escapeHtml(project.category)}</span><div class="project-actions">${demo}<a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer">Code ↗</a><button class="project-detail-link" type="button" data-project-id="${id}">Full details ↗</button></div></div>
        </div></div>
      </div>
    </div>
  </article>`;
}

function setProjectExpanded(card, expanded) {
  const panel = card.querySelector('.project-expand-panel');
  if (!expanded && panel.contains(document.activeElement)) card.querySelector('[data-project-toggle]').focus();
  card.dataset.expanded = String(expanded);
  card.querySelectorAll('[data-project-toggle]').forEach(button => button.setAttribute('aria-expanded', String(expanded)));
  card.querySelector('.expand-label').textContent = expanded ? 'Close overview' : 'About this project';
  panel.inert = !expanded;
  panel.setAttribute('aria-hidden', String(!expanded));
}

function toggleProjectCard(card) {
  const expanded = card.dataset.expanded !== 'true';
  // One open overview keeps a long catalogue easy to scan.
  if (expanded) projectGrid.querySelectorAll('.project-card[data-expanded="true"]').forEach(other => {
    if (other !== card) setProjectExpanded(other, false);
  });
  setProjectExpanded(card, expanded);
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
  observeReveals(projectGrid);
}

function renderModalDots(project) {
  modalDots.innerHTML = project.screenshots.map((_, index) => `
    <button class="modal-dot ${index === state.activeScreenshot ? 'active' : ''}" type="button" data-shot-index="${index}" aria-label="Show screenshot ${index + 1}"></button>
  `).join('');
}

function updateModalScreenshot() {
  const project = state.activeProject;
  if (!project) return;
  const media = modalImage.closest('.modal-media');
  media.hidden = !project.screenshots.length;
  if (!project.screenshots.length) { modalImage.removeAttribute('src'); modalDots.innerHTML = ''; return; }
  const shot = project.screenshots[state.activeScreenshot];
  modalImage.src = shot.src;
  modalImage.alt = shot.alt;
  renderModalDots(project);
  modalDots.hidden = project.screenshots.length < 2;
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
  $('#modalClose').focus();
}

function closeProject() {
  if (modal.open && typeof modal.close === 'function') modal.close();
  else modal.removeAttribute('open');
  document.body.classList.remove('modal-open');
}

function initProjectInteractions() {
  projectGrid.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-project-toggle]');
    if (toggle) { toggleProjectCard(toggle.closest('.project-card')); return; }
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
      $$('.filter-chip').forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', 'true');
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
    if (!(goodName && goodEmail && goodMessage)) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }

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
    document.querySelector(".work-count").textContent = `01—${String(state.projects.length).padStart(2, "0")}`;
    renderProjects();
  } catch (error) {
    console.error('Project data failed to load:', error);
    projectGrid.innerHTML = `<p class="empty-state">Projects could not load. <a href="https://github.com/mohammedzaid00100">View my work on GitHub ↗</a></p>`;
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
  initMotion();
}

let revealObserver;
function observeReveals(root = document) {
  if (!revealObserver) return;
  const selectors = '.reveal, .section-label, .name-panel, .about-columns, .expertise-list details, .work-heading, .project-card, .contact-grid > div, .contact-form';
  root.querySelectorAll(selectors).forEach(node => {
    if (node.dataset.revealObserved) return;
    node.dataset.revealObserved = 'true';
    node.classList.add('reveal', 'reveal-pending');
    revealObserver.observe(node);
  });
}

function initMotion() {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const warp = $('#warpMap');
  const word = $('.hero-word');
  const progress = $('.scroll-progress');
  let frame = 0, distortion = 0, target = 0, lastTime = 0;
  let resetTimer;
  // Ambient CSS animation starts with the document, without a playback control.
  // Reduced-motion visitors get a colour-only version, with no drifting or warping.
  const enabled = () => !media.matches;
  const updateState = () => {
    if (media.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      warp.setAttribute('scale', '0');
      $$('.reveal-pending').forEach(node => node.classList.add('visible'));
    }
  };
  media.addEventListener('change', updateState);
  updateState();
  function animate(time) {
    if (!enabled()) { frame = 0; return; }
    if (time-lastTime > 30) { distortion += (target-distortion)*.15; warp.setAttribute('scale', distortion.toFixed(2)); lastTime=time; }
    if (Math.abs(target-distortion) > .1) frame = requestAnimationFrame(animate);
    else { warp.setAttribute('scale', target); frame = 0; }
  }
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    word.addEventListener('pointermove', event => {
      if (!enabled()) return;
      const box = word.getBoundingClientRect();
      target = 9 + 22 * Math.abs((event.clientX-box.left)/box.width - .5);
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { target=0; if (!frame) frame=requestAnimationFrame(animate); }, 200);
      if (!frame) frame=requestAnimationFrame(animate);
    });
    word.addEventListener('pointerleave', () => { target=0; if (!frame && enabled()) frame=requestAnimationFrame(animate); });
  }
  let scrollFrame;
  const paintScroll = () => {
    const range = document.documentElement.scrollHeight-innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? scrollY/range : 0})`;
    scrollFrame=0;
  };
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame=requestAnimationFrame(paintScroll); }, {passive:true});
  addEventListener('resize', paintScroll);
  paintScroll();
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    }), {threshold: .08});
    observeReveals();
  }
  const rows = $$('.expertise-list details');
  rows.forEach(row => row.addEventListener('toggle', () => {
    if(row.open) rows.forEach(other => { if(other !== row) other.open=false; });
  }));
}

document.addEventListener('DOMContentLoaded', init);
