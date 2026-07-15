# Lean Six Sigma DMAIC Project Portfolio

A static site that acts as a portfolio/database of Lean Six Sigma (DMAIC) projects. Each project gets an interactive DMAIC wheel profile page and auto-generated Charter / Control Plan PDFs. The portfolio landing page lists every project with filtering, sorting, and summary stats.

## How it works

1. **An employee fills out the intake form** at `new-project.html` (open it directly in a browser — no server needed). It walks through Charter, SIPOC, Measure, Analyze, Improve, and Control fields.
2. **On submit, the form downloads a JSON file** (e.g. `reduce-invoice-cycle-time.json`) — nothing is uploaded anywhere automatically, since this is a static site with no backend.
3. **The employee sends that file to the site maintainer** (Kyle), who adds it to `data/projects/` and commits/pushes it to this repo.
4. **GitHub Actions takes it from there**: it validates the data, regenerates the portfolio page and the project's profile page (with the interactive wheel), generates Charter and Control Plan PDFs, and deploys the whole site to GitHub Pages automatically.

## Repo layout

- `data/projects/*.json` — one file per project; this is the source of truth ("the database")
- `project.schema.json` — documents the required/optional fields for a project file
- `new-project.html` — the employee-facing intake form
- `templates/` — plain JS functions that render HTML strings for each page type
- `scripts/build.js` — reads `data/projects/*.json`, generates the static site into `dist/`
- `scripts/generate-pdfs.js` — renders Charter/Control Plan PDFs via Puppeteer
- `.github/workflows/build-and-deploy.yml` — runs the above on every push and deploys to GitHub Pages

## Local development

Requires [Node.js](https://nodejs.org/) (LTS) installed.

```bash
npm install
npm run build      # generates dist/
npm run pdfs        # generates PDFs into dist/ (requires build first)
npm run serve       # serve dist/ at http://localhost:3000
```

Commit `package-lock.json` along with your other changes — CI uses `npm ci`, which requires it.

## One-time GitHub setup

In this repo's **Settings → Pages**, set "Build and deployment" source to **GitHub Actions** (not "Deploy from a branch"). After that, every push to `main` that touches `data/projects/`, `scripts/`, `templates/`, or `assets/` will rebuild and redeploy the site automatically.
