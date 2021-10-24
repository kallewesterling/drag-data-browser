/* eslint-disable no-undef */

const margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 50,
};
const width = 1020;
const height = 600;

// append the svg object to the body of the page
const svg = d3.select('svg#communities')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .attr('transform', `translate(${margin.left},${margin.top})`);

const rect = svg.append('rect')
  .attr('width', width)
  .attr('height', height)
  .style('fill', 'none')
  .style('pointer-events', 'all');

const g = svg.append('g')
  .attr('viewBox', [0, 0, width, height]);

const store = {};

d3.json(`${window.DATA_DIR}/v1-14-days-filtered-node-weight-distributions.json`).then((data) => {
  const columns = Object.keys(data[0]).filter((k) => k !== 'name');
  store.data = {
    y: 'Numbers of communities',
    x: 'Min weight',
    series: data.map((d) => ({
      name: d.name,
      values: columns.map((k) => d[k]),
    })),
    weights: columns.map((k) => k.replace('weight-', '')),
  };

  const y = d3.scaleLinear()
    .domain([0, d3.max(store.data.series, (d) => d3.max(d.values))])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const x = d3.scalePoint()
    .domain(store.data.weights)
    .range([margin.left, width - margin.right]);

  // draw
  const line = d3.line()
    .defined((d) => !Number.isNaN(d))
    .x((d, i) => x(store.data.weights[i]))
    .y((d) => y(d));

  const invertX = (xm) => {
    const domain = x.domain();
    const range = x.range();
    const rangePoints = d3.range(range[0], range[1], x.step());
    const weightIndex = d3.bisectLeft(rangePoints, xm);
    const xPos = domain[weightIndex];
    return xPos;
  };

  const yAxis = (yG) => yG.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call((selector) => selector.select('.domain').remove())
    .call((selector) => selector.select('.tick:last-of-type text').clone()
      .attr('x', 3)
      .attr('text-anchor', 'start')
      .attr('font-weight', 'bold')
      .text(store.data.y));

  const xAxis = (xG) => xG.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(
      d3.axisBottom(x)
        .tickValues(
          x
            .domain()
            .filter((d, i) => i % 5 === 0), // every fifth value from the domain
        ),
    )
    .call((selector) => selector.select('.tick:last-of-type text').clone()
      .attr('y', 30)
      .attr('x', 0)
      .attr('text-anchor', 'end')
      .attr('font-weight', 'bold')
      .text(store.data.x));

  xAxis(g);
  yAxis(g);

  const pathG = svg.append('g')
    .attr('fill', 'none')
    .attr('stroke-width', 1)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round');

  pathG.selectAll('path')
    .data(store.data.series)
    .join('path')
    .style('mix-blend-mode', 'multiply')
    .attr('stroke', 'steelblue')
    .attr('d', (d) => line(d.values));

  const dot = svg.append('g')
    .attr('display', 'none');

  dot.append('circle')
    .attr('r', 2.5);

  dot.append('text')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('text-anchor', 'middle')
    .attr('y', -8);

  const hover = (svgSelection, path) => {
    function moved(event) {
      event.preventDefault();

      const pointer = d3.pointer(event, this);
      const xm = invertX(pointer[0] - margin.left / 2);
      const ym = y.invert(pointer[1]);
      const i = d3.bisect(store.data.weights, xm);
      const s = d3.least(store.data.series, (d) => Math.abs(d.values[i] - ym));

      if (s) {
        path.attr('stroke', (d) => (d === s ? 'steelblue' : '#eee')).filter((d) => d === s).raise();
        dot.attr('transform', `translate(${x(store.data.weights[i])},${y(s.values[i])})`);
        dot.select('text').text(`${s.name}: ${s.values[i]} communities`);
      }
    }

    function entered() {
      path.style('mix-blend-mode', null).attr('stroke', '#eee');
      dot.attr('display', null);
    }

    function left() {
      path.style('mix-blend-mode', 'multiply').attr('stroke', 'steelblue');
      dot.attr('display', 'none');
    }
    if ('ontouchstart' in document) {
      svgSelection
        .style('-webkit-tap-highlight-color', 'transparent')
        .on('touchmove', moved)
        .on('touchstart', entered)
        .on('touchend', left);
    } else {
      svgSelection
        .on('mousemove', moved)
        .on('mouseenter', entered)
        .on('mouseleave', left);
    }
  };
  rect.call(hover, path);
});
