export const PHASES = ['define', 'measure', 'analyze', 'improve', 'control'];
const SLICE_ANGLE = 360 / PHASES.length; // 72 degrees each

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180; // rotate so 0deg starts at 12 o'clock
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeWedge(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
}

const TOPPINGS_RADIUS = 124; // wedges sit inside the crust ring, like pizza toppings

export const WEDGES = PHASES.map((phase, i) => ({
  phase,
  label: phase.charAt(0).toUpperCase() + phase.slice(1),
  d: describeWedge(150, 150, TOPPINGS_RADIUS, i * SLICE_ANGLE, (i + 1) * SLICE_ANGLE),
  labelPos: polarToCartesian(150, 150, 95, i * SLICE_ANGLE + SLICE_ANGLE / 2)
}));

export function phaseState(phase, project) {
  const idxPhase = PHASES.indexOf(phase);
  const idxCurrent = PHASES.indexOf(String(project.currentPhase || '').toLowerCase());
  if (project.status === 'Completed') return 'complete';
  if (idxCurrent === -1) return 'future';
  if (idxPhase < idxCurrent) return 'complete';
  if (idxPhase === idxCurrent) return 'current';
  return 'future';
}

export function renderWheel(project) {
  const paths = WEDGES.map((w) => {
    const state = phaseState(w.phase, project);
    return `<path class="wheel-slice ${state}" data-phase="${w.phase}" d="${w.d}"
      role="button" tabindex="0" aria-label="${w.label} phase (${state})"></path>`;
  }).join('\n      ');

  const labels = WEDGES.map((w) => {
    const state = phaseState(w.phase, project);
    return `<text class="wheel-label ${state}" x="${w.labelPos.x.toFixed(2)}" y="${w.labelPos.y.toFixed(2)}"
      text-anchor="middle" dominant-baseline="middle" data-phase="${w.phase}">${w.label}</text>`;
  }).join('\n      ');

  return `<svg viewBox="0 0 300 300" class="dmaic-wheel" role="group" aria-label="DMAIC phase wheel">
      <circle class="wheel-crust" cx="150" cy="150" r="132"></circle>
      <circle class="wheel-crust-edge" cx="150" cy="150" r="140"></circle>
      ${paths}
      ${labels}
    </svg>`;
}
