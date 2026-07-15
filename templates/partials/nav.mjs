export function renderNav({ basePath = '' } = {}) {
  return `<nav class="site-nav">
    <a class="brand" href="${basePath}index.html">LSS Project Portfolio</a>
    <a class="button" href="${basePath}new-project.html">+ New Project</a>
  </nav>`;
}
