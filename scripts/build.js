import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateProject } from './lib/schema-validate.mjs';
import { computePortfolioStats } from './lib/stats.mjs';
import { renderIndexPage } from '../templates/index.template.mjs';
import { renderProjectPage } from '../templates/project.template.mjs';
import { renderPrintPage, PRINT_DOCS } from '../templates/print.template.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data', 'projects');
const DIST_DIR = path.join(ROOT, 'dist');

function readProjects() {
  if (!fs.existsSync(DATA_DIR)) {
    throw new Error(`Data directory not found: ${DATA_DIR}`);
  }

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  const projects = [];
  const seenSlugs = new Set();
  let hadErrors = false;

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    let project;
    try {
      project = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(`[build] ${file}: invalid JSON — ${err.message}`);
      hadErrors = true;
      continue;
    }

    const errors = validateProject(project);
    const expectedFilename = `${project.slug}.json`;
    if (project.slug && file !== expectedFilename) {
      errors.push({ path: 'slug', message: `Filename "${file}" must match slug: expected "${expectedFilename}"` });
    }
    if (project.slug && seenSlugs.has(project.slug)) {
      errors.push({ path: 'slug', message: `Duplicate slug "${project.slug}" — already used by another project file` });
    }
    if (project.slug) seenSlugs.add(project.slug);

    if (errors.length) {
      hadErrors = true;
      console.error(`[build] ${file} failed validation:`);
      for (const e of errors) console.error(`  - ${e.path}: ${e.message}`);
      continue;
    }

    projects.push(project);
  }

  if (hadErrors) {
    throw new Error('One or more project files failed validation. See errors above.');
  }

  return projects.sort((a, b) => a.title.localeCompare(b.title));
}

function rimraf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function lightweightProjectFields(project) {
  const { id, slug, title, sponsor, businessUnit, status, currentPhase, startDate, actualCompletionDate, financialImpact, control } = project;
  return { id, slug, title, sponsor, businessUnit, status, currentPhase, startDate, actualCompletionDate, financialImpact, control: control ? { finalResults: control.finalResults } : undefined };
}

function build() {
  console.log('[build] Reading and validating project data...');
  const projects = readProjects();
  console.log(`[build] Loaded ${projects.length} project(s).`);

  const stats = computePortfolioStats(projects);

  rimraf(DIST_DIR);
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Escape "<" so a project field containing "</script>" can't break out of the
  // inline <script type="application/json"> tag this gets embedded in.
  const projectsIndexJson = JSON.stringify(projects.map(lightweightProjectFields)).replace(/</g, '\\u003c');
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), renderIndexPage(projects, stats, projectsIndexJson));
  console.log('[build] Wrote index.html');

  for (const project of projects) {
    const projectDir = path.join(DIST_DIR, 'projects', project.slug);
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(projectDir, 'index.html'), renderProjectPage(project));

    const printDir = path.join(projectDir, 'print');
    fs.mkdirSync(printDir, { recursive: true });
    for (const doc of PRINT_DOCS) {
      if (!doc.appliesTo(project)) continue;
      fs.writeFileSync(path.join(printDir, `${doc.key}.html`), renderPrintPage(doc.key, project));
    }
  }
  console.log(`[build] Wrote ${projects.length} project profile page(s).`);

  copyDir(path.join(ROOT, 'assets'), path.join(DIST_DIR, 'assets'));
  copyDir(path.join(ROOT, 'templates'), path.join(DIST_DIR, 'templates'));
  copyDir(path.join(ROOT, 'scripts', 'lib'), path.join(DIST_DIR, 'scripts', 'lib'));
  fs.copyFileSync(path.join(ROOT, 'new-project.html'), path.join(DIST_DIR, 'new-project.html'));
  fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '');
  console.log('[build] Copied assets, templates, shared lib, intake form.');

  console.log('[build] Done. Output in dist/');
}

build();
