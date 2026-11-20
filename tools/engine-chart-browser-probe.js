// Run on /components/chart in a development build (Angular debug API enabled).
// This deliberately drives render directly: it isolates engine checks from IO timing.
(async () => {
  const host = document.querySelector('hy-chart');
  const component = ng.getComponent(host);
  const results = [];
  const check = (name, passed, detail) => {
    results.push({ name, passed: !!passed, detail });
    if (!passed) throw new Error(JSON.stringify(results));
  };
  let previous;
  for (const type of ['line', 'bar', 'area', 'doughnut']) {
    await component.render(component.data(), type, 'en');
    const chart = component.chart;
    check(type, chart && !component.error(), chart?.constructor.version);
    if (previous) check(`${type} replaces disposed instance`, previous.canvas === null);
    if (type === 'area') {
      check(
        'area gradient',
        chart.getDatasetMeta(0).dataset.options.backgroundColor instanceof CanvasGradient,
      );
      chart.resize(500, 240);
      chart.update();
      check(
        'resized area gradient',
        chart.height === 240 &&
          chart.getDatasetMeta(0).dataset.options.backgroundColor instanceof CanvasGradient,
      );
    }
    previous = chart;
  }
  const original = document.documentElement.getAttribute('data-hy-theme');
  document.documentElement.setAttribute('data-hy-theme', 'dark');
  await component.render(component.data(), 'line', 'fa');
  let chart = component.chart;
  check('locale refresh', chart.options.locale === 'fa');
  check(
    'token ink resolved',
    !!chart.options.scales.y.ticks.color,
    chart.options.scales.y.ticks.color,
  );
  chart.tooltip.setActiveElements([{ datasetIndex: 0, index: 0 }], { x: 80, y: 80 });
  chart.update();
  ng.applyChanges(component);
  check('external tooltip', !!document.querySelector('[role="tooltip"]'), component.tooltip());
  const summary = host.querySelector('details summary');
  summary.focus();
  summary.click();
  check(
    'accessible table focus',
    document.activeElement === summary &&
      host.querySelectorAll('tbody tr').length === component.data().labels.length,
  );
  if (original === null) document.documentElement.removeAttribute('data-hy-theme');
  else document.documentElement.setAttribute('data-hy-theme', original);
  await component.render(component.data(), 'bar', 'en');
  check('tooltip removed on replacement', component.tooltip() === null && chart.canvas === null);
  const current = component.chart;
  ng.getOwningComponent(host); // ensure fixture remains Angular-owned
  // Navigate away via the existing router link, allowing normal component teardown.
  const link = [...document.querySelectorAll('a[href]')].find(
    (a) => a.getAttribute('href') === '/components',
  );
  if (link) {
    link.click();
    await new Promise((resolve) => setTimeout(resolve, 300));
    check('route teardown', current.canvas === null && !document.querySelector('[role="tooltip"]'));
  }
  return results;
})();
