(function (global) {
  'use strict';

  const scriptUrl = 'https://www.desmos.com/api/v1.13/calculator.js?apiKey=558d7c0f36724132b1122e3a9c78a575';
  let loading = null;
  let calculator = null;

  function loadApi() {
    if (global.Desmos?.GraphingCalculator) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => global.Desmos?.GraphingCalculator ? resolve() : reject(new Error('Calculator unavailable'));
      script.onerror = () => reject(new Error('Calculator could not load'));
      document.head.appendChild(script);
    }).catch((error) => {
      loading = null;
      document.querySelector(`script[src="${scriptUrl}"]`)?.remove();
      throw error;
    });
    return loading;
  }

  async function open() {
    const dialog = document.getElementById('desmos-dialog');
    const status = document.getElementById('desmos-status');
    dialog.hidden = false;
    status.hidden = false;
    status.textContent = 'Loading calculator…';
    document.getElementById('close-desmos').focus();
    try {
      await loadApi();
      if (dialog.hidden) return;
      if (!calculator) {
        calculator = global.Desmos.GraphingCalculator(document.getElementById('desmos-canvas'), {
          border: false,
          expressions: true,
          settingsMenu: true,
          zoomButtons: true
        });
      }
      calculator.resize();
      status.hidden = true;
    } catch {
      status.textContent = 'The calculator could not load. Check your connection and open it again.';
    }
  }

  function close(destroy = false) {
    const dialog = document.getElementById('desmos-dialog');
    if (!dialog) return;
    const wasOpen = !dialog.hidden;
    dialog.hidden = true;
    if (destroy && calculator) {
      calculator.destroy();
      calculator = null;
    }
    if (wasOpen && !destroy) document.getElementById('open-desmos').focus();
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !document.getElementById('desmos-dialog').hidden) close();
  });

  global.LuminaryDesmos = { open, close };
})(window);
