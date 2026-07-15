const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

// For multi-line text fields (problem statements, findings, etc.) — escapes then
// converts newlines to <br> so paragraph breaks the employee typed are preserved.
export function escapeMultiline(value) {
  return escapeHtml(value).replace(/\n/g, '<br>');
}
