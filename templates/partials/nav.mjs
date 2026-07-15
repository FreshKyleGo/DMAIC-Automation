import { LOGO_PATH } from './brand.mjs';

export function renderNav({ basePath = '' } = {}) {
  return `<nav class="site-nav">
    <a class="brand" href="${basePath}index.html">
      <span class="brand-mark"><img src="${basePath}${LOGO_PATH}" alt="" class="brand-icon"></span>
      <span class="brand-text">
        <span class="brand-chip">LSS<span class="brand-chip-accent">DMAIC</span></span>
        <span class="brand-subtitle">Project Portfolio</span>
      </span>
    </a>
    <a class="button" href="${basePath}new-project.html">+ New Project</a>
  </nav>`;
}
