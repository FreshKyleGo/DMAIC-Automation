import { renderHead } from './partials/head.mjs';
import { renderDefineContent, renderControlContent } from './partials/phase-panels.mjs';
import { escapeHtml } from '../scripts/lib/html-escape.mjs';

const DOC_RENDERERS = {
  charter: { title: 'Project Charter', render: renderDefineContent, appliesTo: (p) => Boolean(p.define && p.define.problemStatement) },
  'control-plan': { title: 'Control Plan', render: renderControlContent, appliesTo: (p) => Boolean(p.control && p.control.controlPlan && p.control.controlPlan.length) }
};

export const PRINT_DOCS = Object.entries(DOC_RENDERERS).map(([key, doc]) => ({
  key,
  title: doc.title,
  appliesTo: doc.appliesTo
}));

export function renderPrintPage(docKey, project) {
  const doc = DOC_RENDERERS[docKey];
  if (!doc) throw new Error(`Unknown print document key: ${docKey}`);
  const basePath = '../../../';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead({ title: `${doc.title} — ${project.title}`, basePath, css: ['print.css'] })}
</head>
<body class="print-doc">
  <header class="print-letterhead">
    <h1>${escapeHtml(project.title)}</h1>
    <p class="print-doc-type">${escapeHtml(doc.title)}</p>
    <p class="print-meta">Sponsor: ${escapeHtml(project.sponsor)} &nbsp;|&nbsp; Owner: ${escapeHtml(project.owner)} &nbsp;|&nbsp; Business Unit: ${escapeHtml(project.businessUnit)}</p>
  </header>
  <main class="print-content">
    ${doc.render(project)}
  </main>
</body>
</html>
`;
}
