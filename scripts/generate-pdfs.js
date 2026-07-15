import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const PROJECTS_DIR = path.join(DIST_DIR, 'projects');

const DOC_KEYS = ['charter', 'control-plan'];

async function generatePdfs() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    throw new Error(`${PROJECTS_DIR} not found — run "npm run build" first.`);
  }

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  let generated = 0;

  try {
    const slugs = fs.readdirSync(PROJECTS_DIR).filter((entry) =>
      fs.statSync(path.join(PROJECTS_DIR, entry)).isDirectory()
    );

    for (const slug of slugs) {
      const printDir = path.join(PROJECTS_DIR, slug, 'print');
      if (!fs.existsSync(printDir)) continue;

      const outDir = path.join(PROJECTS_DIR, slug, 'documents');
      fs.mkdirSync(outDir, { recursive: true });

      for (const docKey of DOC_KEYS) {
        const printPath = path.join(printDir, `${docKey}.html`);
        if (!fs.existsSync(printPath)) continue;

        const page = await browser.newPage();
        await page.goto(pathToFileURL(printPath).href, { waitUntil: 'networkidle0' });
        await page.emulateMediaType('print');
        await page.pdf({
          path: path.join(outDir, `${docKey}.pdf`),
          format: 'Letter',
          printBackground: true,
          margin: { top: '0.75in', bottom: '0.75in', left: '0.75in', right: '0.75in' }
        });
        await page.close();
        generated++;
        console.log(`[pdf] ${slug}/${docKey}.pdf`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`[pdf] Done. Generated ${generated} PDF(s).`);
}

generatePdfs().catch((err) => {
  console.error('[pdf] Failed:', err);
  process.exitCode = 1;
});
