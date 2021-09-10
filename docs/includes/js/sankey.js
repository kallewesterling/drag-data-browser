/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const datafiles = [
  `${DATA_DIR}sankey-data.json`,
  `${DATA_DIR}performer-slugs.json`,
];

window.ERROR_LEVEL = 1;
window.locked = false;
window.MINSIZE = 1300;

const vizHeight = 600;

const opacities = {
  rectStandard: 0.1,
  strokeHighlight: 0.8,
  strokeStandard: 0.2,
  strokeLight: 0.02,
  textStandard: 1,
};

const margin = {
  top: 40, right: 40, bottom: 40, left: 10,
};

const getVizContainer = () => {
  const element = d3.select('#viz-container').node();
  const style = getComputedStyle(element);

  const rect = element.getBoundingClientRect();
  return {
    paddingLeft: +style.paddingLeft.replace('px', ''),
    paddingRight: +style.paddingRight.replace('px', ''),
    width: +style.width.replace('px', ''),
    rect,
  };
};

const width = () => {
  const vizContainer = getVizContainer();
  return vizContainer.width - vizContainer.paddingLeft - vizContainer.paddingRight;
};

const height = () => vizHeight + margin.top + margin.bottom;

const svg = d3
  .select('svg#sankey')
  .attr('width', width())
  .attr('height', height() + margin.top + margin.bottom)
  .classed('border', true)
  .on('mouseout', SVGInteract.mouseOut);

const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

const sankey = d3
  .sankey()
  .nodeId((d) => d.name)
  .nodeWidth(5)
  .nodePadding(20)
  .size([width() - margin.left - margin.right, height()])
  .nodeAlign(d3.sankeyLeft);

const path = sankey.links();

let graph;

const xScale = [];
const yScale = [];

const initialDataProcess = (data) => {
  const getPerformers = (link, paddedTravels = graph.paddedTravels) => paddedTravels[link.source.state][link.target.state][link.startYear].filter((p) => p !== 'filler');
  const nodeMap = {};
  const ret = data;

  ret.color = d3.scaleOrdinal(d3.schemeCategory10);
  ret.stateSlugToName = {};

  data.nodes.forEach((node) => { nodeMap[node.id] = node; });
  ret.links = data.links.map((link) => {
    d = Object.assign(link, {
      source: nodeMap[link.source],
      target: nodeMap[link.target],
      value: link.value,
      startState: link.startState,
      endState: link.endState,
      startYear: link.startYear,
      endYear: link.endYear,
      color: data.color(link.startState),
      displayState: nodeMap[link.source].display.replace(/[0-9]/g, '').trim(),
      performers: [],
      performerCount: 0,
    });
    d.performers = getPerformers(link, data.paddedTravels);
    d.performerCount = link.performers.length;
    return d;
  });

  ret.nodes = data.nodes.map((node) => Object.assign(node, {
    displayState: node.display.replace(/[0-9]/g, '').trim(),
    color: data.color(node.state),
  }));

  data.nodes.forEach((node) => { ret.stateSlugToName[node.state] = node.displayState; });

  log('Data loaded, timestamp:', data.saved);

  return ret;
};

const getSankeyGraph = (data) => {
  graph = sankey(data);
  graph.paddedTravels = data.paddedTravels;
  graph.states = [...new Set(graph.nodes.map((node) => node.state))];
  graph.color = data.color;
  graph.stateSlugToName = data.stateSlugToName;

  graph.nodes.map((node) => {
    sourceCount = d3.sum(node.sourceLinks.map((cmp) => cmp.performerCount));
    targetCount = d3.sum(node.targetLinks.map((cmp) => cmp.performerCount));
    return Object.assign(node, {
      performerCounts: {
        source: sourceCount,
        target: targetCount,
        total: d3.sum([sourceCount, targetCount]),
      },
    });
  });

  return graph;
};

const getLastYear = (state) => {
  if (!state) return undefined;

  let nodes = graph.nodes
    .filter((node) => node.state === state)
    .filter((node) => node.performerCounts.total > 0);

  nodes = nodes.slice(nodes.length - 1);

  if (nodes[0]) {
    return nodes[0].year;
  }
  return undefined;
};

const getStatePaths = (state, lastPath = false, targetState = undefined, lastPathBy = 'startYear') => {
  const getWidth = (elem) => +getComputedStyle(elem)['stroke-width'].replace('px', '');
  let elems = [];
  if (!targetState) {
    elems = [...document.querySelectorAll(`path[data-startState='${state}'][data-endState='${state}']`)];
    if (!elems.length) {
      // state does not have ANY performers that performed in the state two consecutive years.
      elems = [...document.querySelectorAll(`path[data-startState='${state}']`)];
    }
  } else {
    elems = [...document.querySelectorAll(`path[data-startState='${state}'][data-endState='${targetState}']`)];
  }
  let objects = elems.map((elem) => {
    const d = {
      path: elem,
      selector: d3.select(elem),
      startYear: elem.dataset.startYear,
      endYear: elem.dataset.endYear,
      startState: elem.dataset.startState,
      endState: elem.dataset.endState,
      displayState: elem.dataset.displayState,
      performerCount: elem.dataset.performerCount,
      width: getWidth(elem),
      endPoint: elem.getPointAtLength(elem.getTotalLength()),
    };
    return d;
  });
  if (lastPath) {
    objects = objects.sort((a, b) => b[lastPathBy] - a[lastPathBy]);
    return objects[0];
  }
  return objects.sort((a, b) => a[lastPathBy] - b[lastPathBy]);
};

const getTravelsByYear = (state) => {
  dataByYear = d3.range(1930, 1940)
    .map((year) => ({
      year,
      data: graph.links
        .filter((l) => l.startState === state && l.startYear === year && l.performers.length > 0),
    }));
  return d3.range(1930, 1940).map((year) => ({
    state,
    year,
    data: dataByYear[dataByYear.findIndex((d) => d.year === year)].data.map((link) => ({
      startYear: link.startYear,
      endYear: link.endYear,
      endState: link.endState,
      color: link.target.color,
      performers: link.performers,
      endDisplayState: link.target.displayState,
    })),
  }));
};

const showTravels = (d, startYear = 1930, endYear = 1940) => {
  const travels = getTravelsByYear(d.startState);
  d3.range(startYear, endYear).forEach((year) => {
    const elem = d3.select(`div#information-${year}`);
    const ix = travels.findIndex((search) => search.year === year);
    let html = '';
    travels[ix].data.forEach((n) => {
      const color = d3.color(n.color).darker(1);
      color.opacity = 0.1;
      const liStyle = `background:${color}`;
      html += `<h4>${d.source.displayState} &#8594;</h4>`;
      html += `<h4><strong>${n.endDisplayState}</strong></h4><ul>`;
      n.performers.sort().forEach((performer) => {
        html += `<li style='${liStyle}'>`;
        html += graph.performerToSlug[performer] ? `<a href='${DATASET_URL}performer/${graph.performerToSlug[performer]}'>` : '';
        html += `${performer}`;
        html += graph.performerToSlug[performer] ? '</a>' : '';
        html += '</li>';
      });
      html += '</ul>';
    });
    if (html) {
      html = `<h3 class='border-bottom'>${year}</h3>${html}`;
      elem.html(html);
    }
    elem.classed('d-none', false);
  });
  return travels;
};

const hideTravels = () => {
  d3.range(1930, 1940).forEach((year) => {
    d3.select(`div#information-${year}`).classed('d-none', true).html('');
  });
};

const resetView = () => {
  hideTravels();
  d3.select('div#pointer').classed('d-none', true);
  d3.select('div#legend').classed('d-none', true);
  Reset.all.texts();
  Reset.all.paths();
};


document.onkeydown = (event) => {
  evt = event || window.event;
  let isEscape = false;
  if ('key' in evt) {
    isEscape = (evt.key === 'Escape' || evt.key === 'Esc');
  }
  if (isEscape) {
    LinkInteract.click(evt, {}, true);
  }
};

const setupPerformerToSlug = () => {
  const objectFlip = (obj) => {
    const ret = {};
    Object.keys(obj).forEach((key) => {
      ret[obj[key]] = key;
    });
    return ret;
  };
  return objectFlip(graph.slugToPerformer);
};

const dropEmptyPaths = () => {
  d3.selectAll('path[data-performerCount="0"]').remove();
  return true;
};

const checkScreenSize = () => {
  if (window.innerWidth >= window.MINSIZE) {
    d3.select('#screenSizeWarning').classed('d-none', false);
    d3.select('#screenSizeWarningInfo').classed('d-none', true).classed('d-flex', false);
    return true;
  }
  d3.select('#screenSizeWarning').classed('d-none', true);
  d3.select('#screenSizeWarningInfo').classed('d-none', false).classed('d-flex', true);
  return false;
};

Promise.all(datafiles.map((datafile) => d3.json(datafile))).then((files) => {
  log('Correcting data...');

  // eslint-disable-next-line prefer-const
  let [data, slugToPerformer] = files;

  data = initialDataProcess(data);

  graph = getSankeyGraph(data);
  graph.slugToPerformer = slugToPerformer;
  graph.performerToSlug = setupPerformerToSlug();
}).then(() => {
  log('Drawing...');
  drawClickRect(); // setup click event catching background rect
  drawLinks(); // setup links
  drawNodes(); // add in the nodes
  drawRects(); // add the rectangles for the nodes
  drawTexts(); // add in the title for the nodes

  log('Setting up scales...');
  scaleSetupX();
  scaleSetupY();

  log('Setting up info container...');
  drawInfoContainer();
}).then(() => {
  log('Running utilities...');
  checkScreenSize();
  dropEmptyPaths(); // drop all paths with no performer counts
  window.addEventListener('resize', () => { window.location.reload(); }); // TODO: Not optimal but for now reload on resize window
});
