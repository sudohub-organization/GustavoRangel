# Gustavo Rangel — Portfolio Site

A personal portfolio website built to showcase projects, experience, and a bit of personality. It's a fully static, single-page app with smooth section transitions, a 3D interactive avatar, and a few surprises hidden inside.

🌐 **Live site:** [gustavorangel.sudohub.org](https://gustavorangel.sudohub.org)

---

## ✨ Features

- **Single-page navigation** — four sections (Home, Projects, Experience, Contact) with animated dot-based nav
- **Interactive 3D avatar** — click *Dance* to open a draggable modal with a Three.js-powered dancing character
- **Accordion project cards** — each card expands with a live 3D shape, project description, tools used, and links to the live demo or repo
- **Experience timeline** — scrollable vertical timeline pulled from a JSON file
- **Contact form** — powered by Formspree, no backend needed
- **Floating social bubbles** — quick links to GitHub, Linktree, and Buy Me a Coffee
- **Konami code easter egg** — ↑ ↑ ↓ ↓ ← → ← → B A 👾
- **Responsive design** — works on mobile and desktop, with a separate small-screen stylesheet

---

## 🗂️ Project structure

```
├── index.html                  # Main entry point
├── public/
│   ├── css/
│   │   ├── styles.css          # Core styles & animations
│   │   ├── components.css      # Reusable UI component styles
│   │   └── smallscreens.css    # Mobile/small-screen overrides
│   ├── js/
│   │   ├── script.js           # Navigation, project cards, timeline logic
│   │   ├── dance.js            # Three.js avatar setup & dance modal
│   │   └── audio.js            # Audio handling
│   ├── data/
│   │   ├── projects.json       # Project card content & 3D shape config
│   │   └── timeline.json       # Experience timeline entries
│   └── images/                 # Photos, logo, and other assets
├── game/                       # Mini browser game (linked from header)
├── honours/                    # Honours project showcase page
└── projects/                   # Individual project sub-pages
```

---

## 💻 Running locally

The site uses `fetch()` to load JSON data, so it needs to be served — opening `index.html` directly via `file://` won't work.

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

All content is data-driven and easy to change without touching HTML or JS:

| What | File |
|---|---|
| Add / edit projects | `public/data/projects.json` |
| Add / edit experience entries | `public/data/timeline.json` |
| Change colours, fonts, layout | `public/css/styles.css` |
| Change mobile layout | `public/css/smallscreens.css` |

Each project entry supports a title, description, URL, GitHub repo link, emoji list, tech tools, colour accent, 3D shape type, and size scale — tweak away.

---

Feel free to fork this and make it your own. And if you break something, the browser console is your best friend. 🙃
