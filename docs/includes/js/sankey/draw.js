/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

log('draw.js loaded');

const drawTexts = () => {
  log('drawTexts called');
  graph.text = graph.node
    .append('text')
    .attr('x', (d) => d.x0 - 6)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('opacity', 1)
    .attr('text-anchor', 'end')
    .attr('data-performerCount', (d) => d.performerCounts.total)
    .attr('data-state', (d) => d.state)
    .text((d) => d.displayState)
    .filter((d) => d.x0 < width() / 2)
    .attr('x', (d) => d.x1 + 6)
    .attr('text-anchor', 'start');
  return graph.text;
};

const drawNodes = () => {
  const nodeG = g.append('g').attr('id', 'nodes');

  graph.node = nodeG
    .selectAll('.node')
    .data(graph.nodes)
    .join('g')
    .attr('class', 'node')
    .attr('data-id', (d) => d.id)
    .attr('data-performerCount', (d) => d.performerCounts.total);
};

const drawInfoContainer = () => {
  const vizContainer = getVizContainer();
  const infoContainer = d3
    .select('div#information')
    .style('top', `${height() + margin.top + margin.bottom}px`)
    .style('width', `${vizContainer.width}px`)
    .style('padding-left', `${vizContainer.paddingLeft}px`)
    .style('padding-right', `${vizContainer.paddingRight}px`)
    .style('height', `${window.innerHeight - (height() + margin.top + margin.bottom)}px`);

  const infoElements = infoContainer
    .selectAll('div.informationBox')
    .data(xScale)
    .join('div')
    .classed('informationBox', true)
    .attr('id', (d) => `information-${d.year}`)
    .style('left', (d) => `${margin.left + d.x}px`)
    .style('top', '0px')
    .style('width', `${width() / 10 - 5}px`)
    .style('max-width', `${width() / 10 - 5}px`)
    .attr('font-weight', '700')
    .attr('opacity', 0.2)
    .attr('text-anchor', 'start');

  return infoElements;
};

/**
 * drawClickRect() returns a newly created element that is added to the main G element,
 * which serves to catch clicks outside of the drawn elements.
 * @return {object} The resulting d3 selection is returned
 */
const drawClickRect = () => {
  graph.clickRect = g
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('transform', `translate(-${margin.left},-${margin.top})`)
    .attr('width', width())
    .attr('height', height() + margin.top + margin.bottom)
    .attr('fill', getComputedStyle(document.body).backgroundColor);

  graph.clickRect.on('click', (event, d) => LinkInteract.click(event, {}, true));

  return graph.clickRect;
};

/**
 * drawLinks() returns corresponding elements inside a G element `g.paths`, which collects
 * the `path.link` elements that carry the visualization.
 * @return {object} The resulting d3 selection is returned
 */
const drawLinks = () => {
  const linkG = g.append('g').attr('id', 'paths');

  graph.link = linkG
    .selectAll('path.link')
    .data(graph.links)
    .join('path')
    .attr('class', 'link')
    .attr('stroke-width', (d) => d.width)
    .attr('stroke', (d) => (d.performers.length ? d.color : 0))
    .attr('data-startState', (d) => d.startState)
    .attr('data-endState', (d) => d.endState)
    .attr('data-displayState', (d) => d.displayState)
    .attr('data-startYear', (d) => d.startYear)
    .attr('data-endYear', (d) => d.endYear)
    .attr('data-performerCount', (d) => d.performerCount);

  graph.link.attr('d', d3.sankeyLinkHorizontal())
    .attr('y0', (d) => d.y0)
    .attr('y1', (d) => d.y1);

  graph.link.attr('stroke-opacity', opacities.strokeStandard);

  // setup link interactivity
  graph.link.on('click', LinkInteract.click);
  graph.link.on('mouseenter', LinkInteract.mouseOver);
  graph.link.on('mouseout', LinkInteract.mouseOut);
  return graph.link;
};

const drawRects = () => {
  graph.rect = graph.node
    .append('rect')
    .attr('x', (d) => d.x0)
    .attr('y', (d) => d.y0)
    .attr('opacity', (d) => (d.connectedPerformers ? opacities.rectStandard : 0))
    .attr('height', (d) => d.y1 - d.y0)
    .attr('width', sankey.nodeWidth())
    .attr('data-id', (d) => d.id)
    .attr('data-year', (d) => d.year)
    .attr('data-state', (d) => d.state)
    .attr('data-displayState', (d) => d.displayState)
    .attr('data-display', (d) => d.display)
    .style('fill', (d) => (d.color));

  return graph.rect;
};
