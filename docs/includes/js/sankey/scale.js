/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

log('scale.js loaded');

const scaleSetupX = () => {
  document.querySelectorAll('.node[data-id*="new-york"] rect')
    .forEach((elem) => {
      const is1940 = elem.dataset.year === '1940';
      const data = is1940 ? undefined : { x: elem.x.baseVal.value, year: elem.dataset.year };
      if (data) xScale.push(data);
    });

  const xScaleElement = g
    .append('g')
    .attr('id', 'xScale')
    .selectAll('text')
    .data(xScale)
    .join('text')
    .text((d, i) => 1930 + i)
    .attr('x', (d) => d.x + 10)
    .attr('y', 0)
    .attr('dy', '-0.5em')
    .attr('font-weight', '700')
    .attr('opacity', 0.2)
    .attr('text-anchor', 'start');

  return xScaleElement;
};

const scaleSetupY = () => {
  document
    .querySelectorAll('.node[data-id*="1930"] rect')
    .forEach((elem) => {
      yScale.push({ y: elem.y.baseVal.value, state: elem.state });
    });

  yScale.sort((a, b) => a.y - b.y);

  const yScaleElement = g
    .append('g')
    .attr('id', 'yScale')
    .selectAll('text')
    .data(yScale)
    .join('text')
    .text((d) => d.state)
    .attr('x', -20)
    .attr('y', (d, i) => d.y)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end');

  return yScaleElement;
};
