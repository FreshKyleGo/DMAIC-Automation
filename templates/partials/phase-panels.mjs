import { escapeHtml, escapeMultiline } from '../../scripts/lib/html-escape.mjs';

function list(items) {
  if (!items || !items.length) return '<p class="meta">None recorded.</p>';
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function table(headers, rows) {
  if (!rows || !rows.length) return '<p class="meta">None recorded.</p>';
  const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell ?? '')}</td>`).join('')}</tr>`)
    .join('');
  return `<table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

export function renderDefineContent(project) {
  const d = project.define || {};
  const sipoc = d.sipoc || {};
  const team = d.team || {};
  const scope = d.scope || {};

  return `<h2>Define — Project Charter</h2>
    <h3>Problem Statement</h3>
    <p>${escapeMultiline(d.problemStatement)}</p>
    <h3>Goal Statement</h3>
    <p>${escapeMultiline(d.goalStatement)}</p>
    ${d.businessCase ? `<h3>Business Case</h3><p>${escapeMultiline(d.businessCase)}</p>` : ''}
    <h3>Scope</h3>
    <p><strong>In scope:</strong></p>
    ${list(scope.inScope)}
    <p><strong>Out of scope:</strong></p>
    ${list(scope.outOfScope)}
    <h3>Team</h3>
    <p>Sponsor: ${escapeHtml(team.sponsor)}<br>
    Black Belt / Lead: ${escapeHtml(team.blackBelt)}<br>
    Process Owner: ${escapeHtml(team.processOwner)}</p>
    <p><strong>Members:</strong></p>
    ${list(team.members)}
    <h3>SIPOC</h3>
    ${table(
      ['Suppliers', 'Inputs', 'Process', 'Outputs', 'Customers'],
      buildSipocRows(sipoc)
    )}
    <h3>Voice of Customer</h3>
    ${table(
      ['Source', 'Need', 'Critical to Quality'],
      (d.voc || []).map((v) => [v.source, v.need, v.criticalToQuality])
    )}`;
}

function buildSipocRows(sipoc) {
  const cols = [sipoc.suppliers, sipoc.inputs, sipoc.process, sipoc.outputs, sipoc.customers].map((c) => c || []);
  const maxLen = Math.max(0, ...cols.map((c) => c.length));
  const rows = [];
  for (let i = 0; i < maxLen; i++) {
    rows.push(cols.map((c) => c[i] || ''));
  }
  return rows;
}

export function renderMeasureContent(project) {
  const m = project.measure || {};
  return `<h2>Measure — Data & Baseline</h2>
    <h3>Data Collection Plan</h3>
    ${table(
      ['Metric', 'Operational Definition', 'Data Source', 'Sample Size', 'Collection Period'],
      (m.dataCollectionPlan || []).map((p) => [p.metric, p.operationalDefinition, p.dataSource, p.sampleSize, p.collectionPeriod])
    )}
    <h3>Baseline Metrics</h3>
    ${table(
      ['Metric', 'Baseline Value', 'Unit'],
      (m.baselineMetrics || []).map((b) => [b.metric, b.baselineValue, b.unit])
    )}
    <p><strong>Process Sigma:</strong> ${m.processSigma ?? '—'} &nbsp; <strong>Cpk:</strong> ${m.cpk ?? '—'}</p>
    ${m.notes ? `<h3>Notes</h3><p>${escapeMultiline(m.notes)}</p>` : ''}`;
}

export function renderAnalyzeContent(project) {
  const a = project.analyze || {};
  const rca = a.rootCauseAnalysis || {};
  const fishbone = (rca.fishbone && rca.fishbone.categories) || [];
  const fiveWhys = rca.fiveWhys || [];

  const fishboneHtml = fishbone.length
    ? fishbone
        .map((c) => `<p><strong>${escapeHtml(c.category)}:</strong></p>${list(c.causes)}`)
        .join('')
    : '<p class="meta">None recorded.</p>';

  const fiveWhysHtml = fiveWhys.length
    ? fiveWhys
        .map(
          (fw) => `<p><strong>Problem:</strong> ${escapeHtml(fw.problem)}</p>${list(fw.whys)}`
        )
        .join('')
    : '<p class="meta">None recorded.</p>';

  return `<h2>Analyze — Root Cause</h2>
    <h3>Fishbone (6M) Analysis</h3>
    ${fishboneHtml}
    <h3>Five Whys</h3>
    ${fiveWhysHtml}
    <h3>Pareto of Causes</h3>
    ${table(
      ['Category', 'Count'],
      (a.pareto || []).map((p) => [p.category, p.count])
    )}
    ${a.findings ? `<h3>Findings</h3><p>${escapeMultiline(a.findings)}</p>` : ''}`;
}

export function renderImproveContent(project) {
  const im = project.improve || {};
  const pilot = im.pilotResults || {};

  return `<h2>Improve — Solutions & Pilot</h2>
    <h3>Solutions Implemented</h3>
    ${table(
      ['Description', 'Owner', 'Implementation Date'],
      (im.solutions || []).map((s) => [s.description, s.owner, s.implementationDate])
    )}
    ${pilot.pilotPeriod ? `<h3>Pilot Results</h3><p><strong>Period:</strong> ${escapeHtml(pilot.pilotPeriod)}</p>` : ''}
    ${pilot.summary ? `<p>${escapeMultiline(pilot.summary)}</p>` : ''}`;
}

export function renderControlContent(project) {
  const c = project.control || {};
  const final = c.finalResults || {};

  return `<h2>Control — Sustaining the Gain</h2>
    <h3>Control Plan</h3>
    ${table(
      ['Metric', 'Target', 'Frequency', 'Owner', 'Response if Out of Control'],
      (c.controlPlan || []).map((p) => [p.metric, p.target, p.frequency, p.owner, p.responseIfOutOfControl])
    )}
    <h3>Monitoring Metrics</h3>
    ${list(c.monitoringMetrics)}
    <h3>Standard Work Documents</h3>
    ${
      (c.standardWorkDocs || []).length
        ? `<ul>${c.standardWorkDocs
            .map((doc) => `<li><a href="${escapeHtml(doc.url)}">${escapeHtml(doc.title)}</a></li>`)
            .join('')}</ul>`
        : '<p class="meta">None recorded.</p>'
    }
    ${
      final.summary
        ? `<h3>Final Results</h3><p>${escapeMultiline(final.summary)}</p>
           <p>${
             typeof final.actualAnnualizedSavings === 'number'
               ? `<strong>Annualized savings:</strong> €${final.actualAnnualizedSavings.toLocaleString('en-US')}<br>`
               : ''
           }${typeof final.cycleTimeAfter === 'number' ? `<strong>Cycle time after:</strong> ${final.cycleTimeAfter} days` : ''}</p>`
        : ''
    }`;
}

export const PHASE_RENDERERS = {
  define: renderDefineContent,
  measure: renderMeasureContent,
  analyze: renderAnalyzeContent,
  improve: renderImproveContent,
  control: renderControlContent
};
