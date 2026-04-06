# Hey, I'm Gustavo 👋

I'm a **Creative Developer & Designer** who genuinely loves building things — whether that's a slick web experience, a machine learning model, or a 3D interactive avatar that dances when you ask it to (yes, really, check the site).

I'm currently a **Software Developer Intern at Dev4 Online**, where I work across a bunch of stacks — ASP.NET Core, Blazor, Vue, Python… you name it. Before that I spent a couple of years **lecturing at North East Scotland College**, teaching programming, web dev, databases, and Cyber Security. Teaching people to code is genuinely one of my favourite things.

I hold a **BSc (Hons) in Software Development** from Robert Gordon University, where my honours project — MAUI — used machine learning to suggest optimal UI component sizes. And before that, an **HND in Software Development** (with a Distinction 🎉) from NESCol.

---

## 🛠️ What's in this repo

This is the source for my personal portfolio site. It's built with:

- **Tailwind CSS** — for fast, clean styling
- **Three.js** — because flat pages are boring
- **Vanilla JS** — no framework needed for the core logic
- **Formspree** — for the contact form

The site has four sections: Home, Projects, Experience, and Contact. Projects and the experience timeline are loaded from JSON files so they're easy to update without touching the HTML.

Oh, and there's a hidden Konami code easter egg. 👾

---

## 🚀 Projects featured

| Project | What it is |
|---|---|
| **Honours Project (MAUI)** | ML system that analyses requirements and suggests optimal UI component sizes |
| **3D Modelling** | A Three.js 3D avatar integrated into a login page |
| **TinyTales** | Full-stack MEVN platform for writing and sharing short stories |
| **RGU Hack 2025** | 24-hour hackathon project, concept to working product |
| **Data Visualization** | Interactive charts exploring education levels and addiction |
| **Android App** | Zodiac-based insights app built in Java/Kotlin |
| **NLP Analysis** | Sentiment analysis on IMDb movie reviews |
| **PHP Project** | My early deep-dive into server-side scripting |

---

## 💻 Running it locally

The site uses `fetch()` to load JSON data, so you **need** to serve it from a local server — opening the HTML file directly won't work.

```bash
# Option 1 — Node.js
npm install -g serve
serve .

# Option 2 — Python
python -m http.server 5000

# Option 3 — Firebase (if you have the CLI)
firebase serve
```

Then open the URL shown in your terminal (usually `http://localhost:3000` for `serve` and `http://localhost:5000` for Python/Firebase).

---

## 📦 Deploying

The whole site is static, so it'll work on any host.

**Firebase (what I use):**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # set the root as the public directory
firebase deploy
```

**Any other static host (Netlify, Vercel, GitHub Pages):**
Just upload the repository root. Make sure asset paths resolve correctly.

---

## ✏️ Customising

- **Projects** → `public/data/projects.json`
- **Experience timeline** → `public/data/timeline.json`
- **Styles** → `public/css/styles.css`
- **Core logic** → `public/js/script.js`
- **3D dance avatar** → `public/js/dance.js`

---

## 📬 Find me elsewhere

- 🔗 [LinkedIn](https://www.linkedin.com/in/gustavo-rangel-professional/)
- 📺 [YouTube — @GustavoElProfe](https://www.youtube.com/@GustavoElProfe)
- 🌿 [Linktree](https://linktr.ee/defonotgus)
- 🐙 [GitHub — @DefoNotGus](https://github.com/DefoNotGus)
- ☕ [Buy me a coffee](https://www.buymeacoffee.com/defonotgus)

---

Feel free to fork this and make it your own. And if you break something, the browser console is your best friend. 🙃
