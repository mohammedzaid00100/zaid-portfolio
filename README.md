# Mohammed Zaid — Portfolio

A portfolio built with HTML, CSS, and vanilla JavaScript. The redesign uses oversized typography, a cobalt blue accent, a light hero and dark content sections, interactive type distortion, scroll reveals, expandable expertise rows, and large project covers.

[Live portfolio](https://zaid-portfolio-mocha.vercel.app/)

## Projects

The catalogue was checked against the public repositories and GitHub profile README on 8 September 2026.

| Project | Presentation |
| --- | --- |
| Web to EXE | Product/download website; the linked repository is not the desktop packaging engine |
| TimeDesk | Clock, timer, and stopwatch; live demo and source |
| Nalanda School | Multi-page school information website; source |
| Collab Deal OS | Discontinued prototype; clearly labelled demo only |
| PlotGraphify | Incomplete, archived PWA experiment |
| Daily Routine Scheduler | Incomplete scheduling experiment |

Three separate projects were missing from the old portfolio: Web to EXE's website, Nalanda, and Collab Deal OS. The profile also lists this portfolio itself; it is not repeated as its own project card. A fourth separate missing project could not be verified from the connected repositories.

## Local preview

Run `python -m http.server 8000` in the repository directory and open `http://localhost:8000`. Serving over HTTP allows the project JSON to load. No dependency install or build step is needed.

## Add or update a project

Edit `data/projects.json`. Copy an existing object and update its unique `id`, name, description, `visualLabel` (use ` / ` to separate two display lines), technology list, tags, status, features, and links. Keep `demoUrl` null if there is no verified public demo. `screenshots` can be an empty array; add only real project images or clearly described project notes.

Add a `.cover-YOUR-ID` rule to `css/style.css` for an optional project-specific background and text colour. Otherwise the cobalt cover is used. Covers are typographic project identities, not screenshots of the linked applications.

The `tags` values support `javascript`, `react`, `node`, and `pwa`. Keep project status honest, especially for archived experiments. All card data and detail content come from the JSON catalogue.

## Design and interactions

- Original implementation inspired by the supplied portfolio recording. The video shows a finished site, not readable source code, so no claim is made about its framework or exact implementation.
- Locally hosted Anton font (SIL Open Font License included in `assets/fonts/OFL.txt`). System sans-serif for body text.
- Lightweight pointer-driven SVG displacement on the desktop hero; no distortion on mobile.
- Native disclosure elements for expertise and a native dialog for project details.
- Project filtering, screenshot navigation where applicable, light/dark theme switching, mobile menu, keyboard support, and reduced-motion support.
- Automatic staggered letter entrances, a continuous cobalt colour wave, floating background light, and scroll reveals. No playback control, loading overlay, or scroll hijacking. Animation starts with the document before JavaScript interaction. Reduced-motion visitors get slow colour changes without drifting, warping, or entrance movement.
- The existing resume and Formspree endpoint are retained. The form validates input and shows success only after a successful response. Use a real authorised submission to verify delivery; automated QA must not send messages.

## Files

- `index.html`: sections, navigation, contact form, dialog.
- `css/style.css`: palette, layouts, responsive rules, animation.
- `js/script.js`: catalogue, filters, detail viewer, form, motion, theme.
- `data/projects.json`: project content.
- `assets/`: existing resume, project notes, and licensed display font.

## Deployment

The existing Vercel GitHub integration publishes the static repository from `main`. No additional hosting provider or build configuration is required. The redesign preserves the original asset paths and repository history.

### Ambient section motion

Toolkit badges follow staggered floating paths. About uses a floating name and slow accent changes; Projects uses a moving heading, rotating cover geometry, and subtle type movement. Contact headings share the accent animation. Interactive targets and paragraph text remain stationary. Reduced-motion visitors retain slow badge/heading colour changes while spatial movement is disabled.

### Project accordions

Click or tap a project cover or “About this project” to expand its overview in place. Native buttons support Enter and Space. One overview opens at a time; the height animates in both directions without a fixed maximum. Collapsed content is inert and hidden from assistive technology. Source/demo links and the full-details dialog remain available in each expanded overview. Reduced-motion settings remove the height transition.
