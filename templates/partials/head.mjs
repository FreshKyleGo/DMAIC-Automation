import { escapeHtml } from '../../scripts/lib/html-escape.mjs';
import { FAVICON_DATA_URI } from './brand.mjs';

/**
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} [opts.basePath] - relative path back to the site root, e.g. '' at root, '../../' for a project page
 * @param {string[]} [opts.css] - stylesheet filenames relative to assets/css/
 */
export function renderHead({ title, basePath = '', css = ['main.css'] }) {
  const links = css.map((file) => `<link rel="stylesheet" href="${basePath}assets/css/${file}">`).join('\n  ');
  return `<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" type="image/x-icon" href="${FAVICON_DATA_URI}">
  ${links}`;
}
