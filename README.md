# Mohammed Zaid Portfolio

A recruiter-ready, responsive portfolio built with plain HTML, CSS, and JavaScript. The UI uses a liquid-glass / glassmorphism visual system with theme persistence, project filtering, project detail modals, accessible form validation, and JSON-driven project metadata.

## Stack

- HTML5 semantic structure
- CSS3 (Grid, Flexbox, custom properties, glassmorphism, responsive design)
- Vanilla JavaScript (ES2022-style browser APIs, no framework dependency)
- `data/projects.json` for project metadata
- SVG placeholder assets for the hero and project screenshots

## Folder structure

```text
/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── script.js
├── data/
│   └── projects.json
└── assets/
    └── images/
        ├── hero-bg.svg
        ├── project-placeholder.svg
        └── project-placeholder-2.svg
```

## Run locally

Because the project loads `data/projects.json` with `fetch()`, serve it through a local HTTP server instead of opening `index.html` directly.

### Python

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

### VS Code Live Server

Open the folder in VS Code and use the Live Server extension, then open the supplied local URL.

> **Portfolio curation note:** Daily Routine Scheduler and PlotGraphify were intentionally excluded from the public project list because they were unsuccessful projects. They are not rendered as cards and have no screenshot references in `data/projects.json`.

## Deployment

### GitHub Pages

1. Create a repository and push this folder to the repository root.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your main branch and `/ (root)`.
5. Save. GitHub Pages will publish the static site.

No build step is required.

### Netlify

1. Push the project to GitHub/GitLab/Bitbucket, or drag the folder into Netlify Drop.
2. For a Git-connected deployment, use:
   - Build command: *(leave blank)*
   - Publish directory: `.`
3. Deploy.

### Vercel

1. Import the Git repository into Vercel.
2. Choose the project root.
3. Framework preset: **Other** / no framework.
4. Build command: *(leave blank)*
5. Output directory: `.`
6. Deploy.

## Updating TimeDesk

The current TimeDesk live URL is stored in `data/projects.json` under `demoUrl`:

```json
"demoUrl": "https://6a6258c351cca1cc83bbe373--funny-buttercream-93522c.netlify.app/"
```

Replace that value with your new deployed URL whenever the TimeDesk site moves.

## Replacing project screenshots

1. Add your real screenshots to `assets/images/`.
2. Open `data/projects.json`.
3. For each project, replace the `src` values inside `screenshots` with your new files.
4. Keep meaningful `alt` text that describes what is visible in the screenshot.
5. Prefer optimized WebP or AVIF images for real assets when possible.

Example:

```json
"screenshots": [
  {
    "src": "assets/images/timedesk-dashboard.webp",
    "alt": "TimeDesk dashboard showing the active timer and daily time summary"
  }
]
```

## Before public launch

- Replace GitHub placeholder URLs with real repository links.
- The repository already includes `assets/Mohammed-Zaid-Resume.pdf`, and the Contact section links to it with a direct download attribute.
- Replace all placeholder screenshots.
- Connect the contact form to Formspree, Netlify Forms, or a custom API endpoint.
- Add real analytics only after choosing an analytics provider and privacy approach.
- Verify keyboard navigation, focus states, contrast, and screen-reader labels on the final content.

## Migration path to React/Vite later

The project is intentionally organized so the migration is straightforward:

- `data/projects.json` becomes a JS/TS data module or API source.
- Project cards and the modal become reusable React components.
- CSS custom properties can remain as the design-token layer.
- `js/script.js` logic maps cleanly to React state and hooks.
- The static asset folder can move directly into a Vite `public/` or `src/assets/` structure.


## Portfolio project hierarchy

The Projects section intentionally presents **TimeDesk** as the priority project because it is the successful, deployed project with a live demo. **Daily Routine Scheduler** and **PlotGraphify** remain visible as archived / failed builds so the portfolio shows the full learning journey without presenting them as production-ready work.

The TimeDesk card contains a direct **TimeDesk Live Demo** link and a README details panel sourced from the provided project README.

### Updating project screenshots
Replace the placeholder files under `assets/images/` with real screenshots and keep the filenames referenced in `data/projects.json`, or edit the `screenshots` paths there.
