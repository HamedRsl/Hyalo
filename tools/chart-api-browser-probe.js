// Development-only diagnostic; run on /components/chart with Angular debug enabled.
(async () => {
  const host = document.querySelector('hy-chart');
  const component = ng.getComponent(host);
  const results = [];
  const check = (name, passed, detail) => {
    results.push({ name, passed: !!passed, detail });
    if (!passed) throw new Error(JSON.stringify(results));
  };
  const original = { options: component.options, plugins: component.plugins };
  let clicks = 0, replacedClicks = 0, selected = 0;
  const lifecycle = [];
  const plugin = id => ({ id, beforeInit: () => lifecycle.push(`${id}:init`), beforeDestroy: () => lifecycle.push(`${id}:destroy`), afterDraw: () => lifecycle.push(`${id}:draw`) });
  const subscription = component.dataPointSelected.subscribe(event => {
    if (event.elements[0]?.datasetIndex === 0 && event.elements[0]?.index === 0) selected++;
  });
  try {
    component.options = () => ({ animation: false, onClick() { clicks++; }, scales: { y: { max: 100 } } });
    component.plugins = () => [plugin('first')];
    await component.render(component.data(), 'line', 'en');
    let chart = component.chart;
    check('partial merge', chart.options.scales.y.max === 100 && typeof chart.options.plugins.tooltip.external === 'function');
    check('plugin registration and draw', lifecycle.includes('first:init') && lifecycle.includes('first:draw'));
    const point = chart.getDatasetMeta(0).data[0];
    const rect = chart.canvas.getBoundingClientRect();
    chart.canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: rect.left + point.x, clientY: rect.top + point.y }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    check('real point activation and composed callback', selected === 1 && clicks === 1, { selected, clicks });
    chart.options.onClick({ type: 'click' }, [], chart);
    check('empty activation suppressed but consumer called', selected === 1 && clicks === 2);
    const png = component.toBase64Image();
    const image = new Image(); image.src = png; await image.decode();
    check('PNG decodes', png.startsWith('data:image/png;base64,') && image.naturalWidth > 0, { width: image.naturalWidth, height: image.naturalHeight });
    check('canvas access', component.getCanvas() === chart.canvas);
    const updates = chart._metasets;
    component.refresh();
    check('refresh retains live instance', component.chart === chart && chart.canvas !== null);
    component.options = () => ({ animation: false, onClick() { replacedClicks++; } });
    component.plugins = () => [plugin('second')];
    await component.render(component.data(), 'bar', 'en');
    check('plugin replacement teardown', chart.canvas === null && lifecycle.includes('first:destroy') && lifecycle.includes('second:init'));
    chart = component.chart;
    check('option replacement drops old max', chart.options.scales.y.max !== 100);
    chart.options.onClick({ type: 'click' }, [], chart);
    check('callback replacement', replacedClicks === 1 && clicks === 2);
    for (const type of ['pie', 'radar', 'polarArea', 'scatter', 'bubble', 'area', 'bar']) {
      const data = { labels: ['A', 'B'], series: [{ label: 'Values', values: [10, 20], points: [{ x: 1, y: 10, r: 4 }, { x: 2, y: 20, r: 8 }] }] };
      const previous = component.chart;
      await component.render(data, type, 'en');
      chart = component.chart;
      check(`${type} real controller`, !!chart && !component.error() && chart.getDatasetMeta(0).data.length === 2 && previous.canvas === null, chart.getDatasetMeta(0).type);
      if (['scatter', 'bubble'].includes(type)) check(`${type} coordinates`, chart.getDatasetMeta(0)._parsed[1].y === 20);
      if (type === 'area') check('area gradient', chart.getDatasetMeta(0).dataset.options.backgroundColor instanceof CanvasGradient);
    }
    check('accessible fallback remains', host.querySelectorAll('tbody tr').length === component.data().labels.length && !!host.querySelector('summary'));
    component.options = original.options; component.plugins = original.plugins;
    const previous = component.chart;
    component.reinitialize(); ng.applyChanges(component);
    await new Promise(r => setTimeout(r, 200));
    check('public reinitialize destroys and recreates', previous.canvas === null && component.chart !== previous && component.chart?.canvas);
    const last = component.chart;
    document.querySelector('a[href="/components"]').click();
    await new Promise(r => setTimeout(r, 300));
    check('route destroy clears public access', last.canvas === null && component.getCanvas() === null && component.toBase64Image() === undefined);
    component.refresh();
  } finally { component.options = original.options; component.plugins = original.plugins; subscription.unsubscribe(); }
  return results;
})();
