/**
 * Monte Carlo π simulation with D3 visualization.
 */
import { methods } from './methods.js';

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('nValue');
  const methodEl = document.getElementById('methodSelect');
  const piEl = document.getElementById('pi');
  const nValEl = document.getElementById('nValue-value');

  // Chart dimensions and margins
  const margin = { top: 20, right: 15, bottom: 60, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Scales mapping [0,1] to chart dimensions
  const xScale = d3.scale.linear().domain([0, 1]).range([0, width]);

  const yScale = d3.scale.linear().domain([0, 1]).range([height, 0]);

  // Scatter plot SVG container inside its dedicated div
  const svg = d3
    .select('#scatter')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'chart');

  const main = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // X axis
  main
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.svg.axis().scale(xScale).orient('bottom'));

  // Y axis
  main.append('g').call(d3.svg.axis().scale(yScale).orient('left'));

  // Container for scatter points
  const g = main.append('g');

  // Convergence plot setup
  const convMargin = { top: 20, right: 20, bottom: 30, left: 50 };
  const convWidth = width - convMargin.left - convMargin.right;
  const convHeight = 200;
  const convSvg = d3
    .select('#convergence')
    .append('svg')
    .attr('width', convWidth + convMargin.left + convMargin.right)
    .attr('height', convHeight + convMargin.top + convMargin.bottom)
    .append('g')
    .attr('transform', `translate(${convMargin.left},${convMargin.top})`);
  const xConv = d3.scale.linear().range([0, convWidth]);
  const yConv = d3.scale.linear().range([convHeight, 0]);
  const xAxisConv = d3.svg.axis().scale(xConv).orient('bottom');
  const yAxisConv = d3.svg.axis().scale(yConv).orient('left');
  convSvg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${convHeight})`);
  convSvg.append('g').attr('class', 'y-axis');
  // Convergence plot axis labels
  convSvg
    .append('text')
    .attr('class', 'axis-label')
    .attr('text-anchor', 'middle')
    .attr('x', convWidth / 2)
    .attr('y', convHeight + convMargin.bottom - 5)
    .text('Iteration');
  convSvg
    .append('text')
    .attr('class', 'axis-label')
    .attr('text-anchor', 'middle')
    .attr(
      'transform',
      `translate(${-convMargin.left + 15},${convHeight / 2}) rotate(-90)`
    )
    .text('π Estimate');
  const areaGen = d3.svg.area().x((d, i) => xConv(i + 1));
  const lineGen = d3.svg
    .line()
    .x((d, i) => xConv(i + 1))
    .y((d) => yConv(d));
  convSvg
    .append('path')
    .attr('class', 'area')
    .style('fill', 'lightsteelblue')
    .style('opacity', 0.3);
  convSvg
    .append('path')
    .attr('class', 'line')
    .style('fill', 'none')
    .style('stroke', 'steelblue');

  /**
   * Dispatch to the selected sampling method.
   * @param {string} key - method key
   * @param {number} N - number of samples
   * @returns {{points: Array<[number,number]>, values: number[]}}
   */
  function simulate(key, N) {
    const fn = methods[key] || methods.quarter;
    return fn(N);
  }

  // Variance bar chart setup (standard error comparison)
  const varSvg = d3
    .select('#variance')
    .append('svg')
    .attr('width', convWidth + convMargin.left + convMargin.right)
    .attr('height', convHeight + convMargin.top + convMargin.bottom)
    .append('g')
    .attr('transform', `translate(${convMargin.left},${convMargin.top})`);
  const methodKeys = Object.keys(methods);
  const xBar = d3.scale
    .ordinal()
    .domain(methodKeys)
    .rangeBands([0, convWidth], 0.2);
  const yBar = d3.scale.linear().range([convHeight, 0]);
  const xAxisBar = d3.svg.axis().scale(xBar).orient('bottom');
  const yAxisBar = d3.svg.axis().scale(yBar).orient('left');
  varSvg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${convHeight})`)
    .call(xAxisBar);
  varSvg.append('g').attr('class', 'y-axis');
  // Variance chart axis labels
  varSvg
    .append('text')
    .attr('class', 'axis-label')
    .attr('text-anchor', 'middle')
    .attr('x', convWidth / 2)
    .attr('y', convHeight + convMargin.bottom - 5)
    .text('Method');
  varSvg
    .append('text')
    .attr('class', 'axis-label')
    .attr('text-anchor', 'middle')
    .attr(
      'transform',
      `translate(${-convMargin.left + 15},${convHeight / 2}) rotate(-90)`
    )
    .text('Std. Error (π)');

  /**
   * Update both scatter and convergence charts.
   * @param {number} N - number of simulations
   */
  function update(N) {
    const methodKey = methodEl.value;
    nValEl.textContent = N;
    const { points, values } = simulate(methodKey, N);

    // Scatter plot (only if 2D points available)
    const scatter = g.selectAll('circle').data(points);
    scatter.exit().remove();
    scatter.enter().append('circle').attr('r', 2);
    scatter
      .attr('cx', (d) => xScale(d[0]))
      .attr('cy', (d) => yScale(d[1]))
      .style('fill', (d) => (d[0] * d[0] + d[1] * d[1] < 1 ? 'blue' : 'red'));

    // Cumulative π estimates for convergence
    const cumEst = [];
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
      const avg = sum / (i + 1);
      // scale for methods that require *4 (quarter circle)
      cumEst.push(methodKey === 'integral' ? avg : avg * 4);
    }
    // Compute error bands (±1σ/√i)
    const lower = [];
    const upper = [];
    let sumSq = 0;
    for (let i = 0; i < values.length; i++) {
      sumSq += values[i] * values[i];
      const meanY = sum / (i + 1);
      const varY = sumSq / (i + 1) - meanY * meanY;
      const se = Math.sqrt(varY / (i + 1));
      // convert to π scale
      const center = cumEst[i];
      const delta = methodKey === 'integral' ? se : 4 * se;
      lower.push(center - delta);
      upper.push(center + delta);
    }
    // Update convergence chart axes & area/line
    const Nmax = Math.max(1, values.length);
    xConv.domain([1, Nmax]);
    const yMin = d3.min(lower.concat(cumEst));
    const yMax = d3.max(upper.concat(cumEst));
    yConv.domain([yMin * 0.95, yMax * 1.05]);
    convSvg.select('.x-axis').call(xAxisConv);
    convSvg.select('.y-axis').call(yAxisConv);
    convSvg
      .select('.area')
      .datum(cumEst)
      .attr(
        'd',
        areaGen.y0((d, i) => yConv(lower[i])).y1((d, i) => yConv(upper[i]))
      );
    convSvg.select('.line').datum(cumEst).attr('d', lineGen);

    // Display final approximation
    const final = cumEst.length > 0 ? cumEst[cumEst.length - 1] : 0;
    piEl.textContent = values.length > 0 ? final.toFixed(4) : 'N/A';

    // Update variance/comparison bar chart (standard error per method)
    const seData = methodKeys.map((key) => {
      const { values: vals } = simulate(key, N);
      const sumVal = d3.sum(vals);
      const sumSqVal = d3.sum(vals.map((v) => v * v));
      const mean = sumVal / vals.length;
      const varY = sumSqVal / vals.length - mean * mean;
      const se = Math.sqrt(varY / vals.length);
      const sePi = key === 'integral' ? se : 4 * se;
      return { method: key, se: sePi };
    });
    const yMaxBar = d3.max(seData, (d) => d.se) || 0;
    yBar.domain([0, yMaxBar * 1.1]);
    varSvg.select('.y-axis').call(yAxisBar);
    const bars = varSvg.selectAll('.bar').data(seData);
    bars.exit().remove();
    bars
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xBar(d.method))
      .attr('width', xBar.rangeBand())
      .style('fill', 'orange');
    bars
      .attr('y', (d) => yBar(d.se))
      .attr('height', (d) => convHeight - yBar(d.se));
  }

  // Hook up input, method change, pause/resume and animation button
  inputEl.addEventListener('input', () => update(+inputEl.value));
  methodEl.addEventListener('change', () => {
    update(+inputEl.value);
    gpuControls.style.display = methodEl.value === 'gpuGrid' ? 'flex' : 'none';
  });
  batchSlider.addEventListener(
    'input',
    () => (batchLabel.textContent = batchSlider.value)
  );
  pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    if (!isPaused) update(cumPoints.length);
  });
  document
    .getElementById('animateBtn')
    .addEventListener('click', () => animate(+inputEl.value));
  update(+inputEl.value || 0);

  /**
   * Animate streaming sampling via Web Worker.
   * @param {number} total - total samples to generate
   */
  function animate(total) {
    // clear existing charts
    g.selectAll('circle').remove();
    convSvg.selectAll('.area, .line').remove();
    varSvg.selectAll('.bar').remove();
    piEl.textContent = '...';

    const isGPU = methodEl.value === 'gpuGrid';
    const worker = new Worker('js/worker.js', { type: 'module' });
    const batchSize = +batchSlider.value;
    let cumPoints = [];
    let cumValues = [];
    let startTime;

    worker.onmessage = (e) => {
      const { points, values, done } = e.data;
      if (done) {
        worker.terminate();
        if (isGPU && startTime) {
          gpuTime.textContent = Math.round(performance.now() - startTime);
        }
        return;
      }
      cumPoints = cumPoints.concat(points);
      cumValues = cumValues.concat(values);
      if (!isPaused) update(cumPoints.length);
      if (isGPU && !startTime) startTime = performance.now();
    };
    worker.postMessage({ methodKey: methodEl.value, total, batchSize });
  }
});
