import { slugify } from '../../scripts/lib/slugify.mjs';
import { validateProject } from '../../scripts/lib/schema-validate.mjs';

function linesToArray(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function num(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : undefined;
}

function addRepeatRow(container) {
  const template = container.querySelector('template');
  const rowsContainer = container.querySelector('.repeat-rows');
  const clone = template.content.cloneNode(true);
  rowsContainer.appendChild(clone);
}

function initRepeatContainers(form) {
  form.querySelectorAll('.repeat-container').forEach((container) => {
    addRepeatRow(container); // seed with one starter row
  });

  form.querySelectorAll('.add-row').forEach((btn) => {
    btn.addEventListener('click', () => {
      const container = form.querySelector(`.repeat-container[data-repeat="${btn.dataset.repeat}"]`);
      addRepeatRow(container);
    });
  });

  form.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-row')) {
      e.target.closest('.repeat-row').remove();
    }
  });
}

function collectRepeatRows(form, repeatKey) {
  const container = form.querySelector(`.repeat-container[data-repeat="${repeatKey}"]`);
  const fields = container.dataset.fields.split(',');
  const rows = [];
  container.querySelectorAll('.repeat-row').forEach((rowEl) => {
    const row = {};
    let hasValue = false;
    for (const field of fields) {
      const input = rowEl.querySelector(`[data-field="${field}"]`);
      if (!input) continue;
      const raw = input.value.trim();
      if (raw) hasValue = true;
      row[field] = input.type === 'number' ? num(raw) : raw;
    }
    if (hasValue) rows.push(row);
  });
  return rows;
}

function buildProjectObject(form) {
  const fd = new FormData(form);
  const get = (name) => (fd.get(name) || '').toString().trim();

  const now = new Date().toISOString();
  const title = get('title');

  const project = {
    id: `proj-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    slug: slugify(title),
    title,
    sponsor: get('sponsor'),
    owner: get('owner'),
    team: linesToArray(get('team')),
    businessUnit: get('businessUnit'),
    status: get('status'),
    currentPhase: get('currentPhase'),
    startDate: get('startDate'),
    targetCompletionDate: get('targetCompletionDate') || null,
    actualCompletionDate: get('actualCompletionDate') || null,
    financialImpact: {
      type: get('financialImpactType') || undefined,
      annualizedAmount: num(get('financialImpactAmount')),
      currency: 'EUR',
      notes: get('financialImpactNotes') || undefined
    },
    define: {
      problemStatement: get('problemStatement'),
      goalStatement: get('goalStatement'),
      businessCase: get('businessCase') || undefined,
      scope: {
        inScope: linesToArray(get('inScope')),
        outOfScope: linesToArray(get('outOfScope'))
      },
      team: {
        sponsor: get('sponsor'),
        blackBelt: get('teamBlackBelt') || undefined,
        processOwner: get('teamProcessOwner') || undefined,
        members: linesToArray(get('team'))
      },
      sipoc: {
        suppliers: linesToArray(get('sipocSuppliers')),
        inputs: linesToArray(get('sipocInputs')),
        process: linesToArray(get('sipocProcess')),
        outputs: linesToArray(get('sipocOutputs')),
        customers: linesToArray(get('sipocCustomers'))
      },
      voc: collectRepeatRows(form, 'voc')
    },
    measure: {
      dataCollectionPlan: collectRepeatRows(form, 'dataCollectionPlan'),
      baselineMetrics: collectRepeatRows(form, 'baselineMetrics'),
      processSigma: num(get('processSigma')),
      cpk: num(get('cpk')),
      notes: get('measureNotes') || undefined
    },
    analyze: {
      rootCauseAnalysis: {
        fishbone: {
          categories: [
            { category: 'Method', causes: linesToArray(get('fishboneMethod')) },
            { category: 'Machine', causes: linesToArray(get('fishboneMachine')) },
            { category: 'Material', causes: linesToArray(get('fishboneMaterial')) },
            { category: 'Manpower', causes: linesToArray(get('fishboneManpower')) },
            { category: 'Measurement', causes: linesToArray(get('fishboneMeasurement')) },
            { category: 'Environment', causes: linesToArray(get('fishboneEnvironment')) }
          ]
        },
        fiveWhys: get('fiveWhysProblem')
          ? [{ problem: get('fiveWhysProblem'), whys: linesToArray(get('fiveWhysList')).slice(0, 5) }]
          : []
      },
      pareto: collectRepeatRows(form, 'pareto'),
      findings: get('findings') || undefined
    },
    improve: {
      solutions: collectRepeatRows(form, 'solutions'),
      pilotResults: {
        pilotPeriod: get('pilotPeriod') || undefined,
        summary: get('pilotSummary') || undefined
      }
    },
    control: {
      controlPlan: collectRepeatRows(form, 'controlPlan'),
      monitoringMetrics: linesToArray(get('monitoringMetrics')),
      standardWorkDocs: collectRepeatRows(form, 'standardWorkDocs'),
      finalResults: {
        summary: get('finalResultsSummary') || undefined,
        actualAnnualizedSavings: num(get('actualAnnualizedSavings')),
        cycleTimeAfter: num(get('cycleTimeAfter'))
      }
    },
    createdAt: now,
    updatedAt: now
  };

  return project;
}

function showErrors(errors) {
  const el = document.getElementById('form-errors');
  const successEl = document.getElementById('form-success');
  successEl.hidden = true;
  el.hidden = false;
  el.innerHTML = `<strong>Please fix the following before submitting:</strong>
    <ul>${errors.map((e) => `<li>${e.path}: ${e.message}</li>`).join('')}</ul>`;
  el.scrollIntoView({ behavior: 'smooth' });
}

function showSuccess(filename) {
  const el = document.getElementById('form-success');
  const errorsEl = document.getElementById('form-errors');
  errorsEl.hidden = true;
  el.hidden = false;
  el.innerHTML = `<strong>Downloaded ${filename}</strong><br>Send this file to the site maintainer to add it to
    <code>data/projects/</code> and commit it — the portfolio site will rebuild automatically.`;
  el.scrollIntoView({ behavior: 'smooth' });
}

function downloadJson(project) {
  const filename = `${project.slug}.json`;
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return filename;
}

function initForm() {
  const form = document.getElementById('project-form');
  if (!form) return;

  initRepeatContainers(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const project = buildProjectObject(form);
    const errors = validateProject(project);
    if (errors.length) {
      showErrors(errors);
      return;
    }
    const filename = downloadJson(project);
    showSuccess(filename);
  });
}

document.addEventListener('DOMContentLoaded', initForm);
