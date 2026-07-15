const STATUS_VALUES = ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
const PHASE_VALUES = ['Define', 'Measure', 'Analyze', 'Improve', 'Control'];
const IMPACT_TYPE_VALUES = ['Hard Savings', 'Soft Savings', 'Cost Avoidance', 'Revenue'];
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const TOP_LEVEL_REQUIRED = ['id', 'slug', 'title', 'sponsor', 'owner', 'businessUnit', 'status', 'currentPhase', 'startDate', 'define'];
const DEFINE_REQUIRED = ['problemStatement', 'goalStatement'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates a project object against the LSS DMAIC project schema.
 * Returns an array of { path, message } errors. Empty array = valid.
 */
export function validateProject(project) {
  const errors = [];
  const fail = (path, message) => errors.push({ path, message });

  if (!project || typeof project !== 'object') {
    return [{ path: '(root)', message: 'Project data must be a JSON object' }];
  }

  for (const field of TOP_LEVEL_REQUIRED) {
    if (project[field] === undefined || project[field] === null || project[field] === '') {
      fail(field, `Missing required field "${field}"`);
    }
  }

  if (project.slug !== undefined && !SLUG_PATTERN.test(project.slug)) {
    fail('slug', `Slug "${project.slug}" must be lowercase letters/numbers separated by single hyphens`);
  }

  if (project.status !== undefined && !STATUS_VALUES.includes(project.status)) {
    fail('status', `Status "${project.status}" must be one of: ${STATUS_VALUES.join(', ')}`);
  }

  if (project.currentPhase !== undefined && !PHASE_VALUES.includes(project.currentPhase)) {
    fail('currentPhase', `currentPhase "${project.currentPhase}" must be one of: ${PHASE_VALUES.join(', ')}`);
  }

  if (project.financialImpact && project.financialImpact.type !== undefined
      && !IMPACT_TYPE_VALUES.includes(project.financialImpact.type)) {
    fail('financialImpact.type', `financialImpact.type "${project.financialImpact.type}" must be one of: ${IMPACT_TYPE_VALUES.join(', ')}`);
  }

  if (project.define && typeof project.define === 'object') {
    for (const field of DEFINE_REQUIRED) {
      if (!isNonEmptyString(project.define[field])) {
        fail(`define.${field}`, `Missing required field "define.${field}"`);
      }
    }
  }

  return errors;
}

export { STATUS_VALUES, PHASE_VALUES, IMPACT_TYPE_VALUES, SLUG_PATTERN };
