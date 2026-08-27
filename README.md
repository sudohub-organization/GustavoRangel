# Gustavo Rangel — Portfolio Site

A personal portfolio website built to showcase projects, experience, and a bit of personality. It is a static-first single page with progressive JavaScript enhancements for navigation, featured project data, and the lazy-loaded 3D dance easter egg.

🌐 **Live site:** [gustavorangel.sudohub.org](https://gustavorangel.sudohub.org)

---

## ✨ Features

- **Static-first portfolio page** — header, hero, featured work, skills, experience, and contact live in `index.html`
- **Single-page navigation** — section links are enhanced with active-state tracking
- **Interactive 3D avatar** — click *Dance* to lazy-load a draggable Three.js-powered dancing character
- **Pages CMS-ready content** — hero, projects, skills, experience, contact copy, and LinkedIn feed heading are editable through JSON files
- **Featured project cards** — focused cards loaded from a small JSON file with role, stack, year, and links
- **LinkedIn feed** — embedded through Elfsight for recent professional updates
- **Contact form** — powered by Formspree, no backend needed
- **Floating social bubbles** — quick links to GitHub, Linktree, and Buy Me a Coffee
- **Konami code easter egg** — ↑ ↑ ↓ ↓ ← → ← → B A 👾
- **Responsive design** — works on mobile and desktop, with a separate small-screen stylesheet

---

## 🗂️ Project structure

```text
├── index.html                  # Main portfolio page
├── 404.html                    # Custom 404 page
├── notready.html               # Placeholder page for unfinished routes
├── public/
│   ├── css/
│   │   ├── styles.css          # CSS imports
│   │   ├── 404.css             # Shared error/placeholder page styling
│   │   ├── base.css            # Design tokens and base element styles
│   │   ├── layout.css          # Page and section layout
│   │   ├── components.css      # Reusable portfolio component styles
│   │   ├── sections.css        # Section backgrounds
│   │   ├── utilities.css       # Small utility classes
│   │   └── responsive.css      # Mobile/small-screen overrides
│   ├── js/
│   │   ├── script.js           # Progressive enhancement entrypoint
│   │   ├── dance.js            # Lazy-loaded Three.js avatar setup
│   │   ├── audio.js            # Audio handling
│   │   └── modules/            # Small enhancement modules
│   ├── data/
│   │   ├── site.json           # Editable page copy and section data
│   │   └── projects.json       # Featured project card content
│   ├── docs/                   # Static document exports
│   └── images/                 # Photos, logos, and other assets
├── game/                       # Mini browser game (linked from header)
├── honours/                    # Honours project showcase and survey pages
└── projects/                   # Individual project sub-pages
```

---

## 💻 Running locally

The page has meaningful static content without JavaScript. To load project JSON and the lazy dance feature, serve the repo locally instead of opening `index.html` directly via `file://`.

```bash
# Node.js
npm install -g serve
serve .
# → http://localhost:3000

# Python
python -m http.server 5000
# → http://localhost:5000

# Firebase CLI
firebase serve
# → http://localhost:5000
```

---

## 📦 Deploying

The site is fully static and works on any host.

**Firebase Hosting:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # use the repo root as the public directory
firebase deploy
```

**Netlify / Vercel / GitHub Pages:**
Upload the repository root. No build step required — just make sure asset paths resolve from the root.

---

## ✏️ Updating content

Pages CMS is configured through `.pages.yml` to edit the content files in `public/data/`. After the Pages CMS GitHub App is connected, update the site through the CMS UI or edit these files directly:

| What | File |
|---|---|
| Edit hero, LinkedIn heading, skills, experience, contact | `public/data/site.json` |
| Add / edit projects | `public/data/projects.json` |
| Change colours, fonts, layout | `public/css/*.css` |
| Change mobile layout | `public/css/responsive.css` |

Each project entry supports `title`, `summary`, `role`, `stack`, `year`, `links`, and `featured`.
See `CMS_COMPONENTS.md` for the current CMS-editable component inventory and simplification candidates.

---

Feel free to fork this and make it your own. And if you break something, the browser console is your best friend. 🙃
