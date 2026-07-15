function activatePhase(phase) {
  document.querySelectorAll('.wheel-slice, .wheel-label').forEach((el) => {
    el.setAttribute('aria-selected', el.dataset.phase === phase ? 'true' : 'false');
  });
  document.querySelectorAll('.phase-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.phase === phase);
  });
  const tab = document.querySelector(`.phase-tab[data-phase="${phase}"]`);
  document.querySelectorAll('.phase-tab').forEach((t) => t.classList.remove('active'));
  if (tab) tab.classList.add('active');
}

function initWheel() {
  const slices = document.querySelectorAll('.wheel-slice');
  if (!slices.length) return;

  slices.forEach((slice) => {
    slice.addEventListener('click', () => activatePhase(slice.dataset.phase));
    slice.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activatePhase(slice.dataset.phase);
      }
    });
  });

  document.querySelectorAll('.phase-tab').forEach((tab) => {
    tab.addEventListener('click', () => activatePhase(tab.dataset.phase));
  });

  const initialPhase = document.body.dataset.currentPhase || 'define';
  activatePhase(initialPhase);
}

document.addEventListener('DOMContentLoaded', initWheel);
