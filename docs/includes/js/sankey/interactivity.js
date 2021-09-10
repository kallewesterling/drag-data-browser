/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const Dim = {
  all: {
    texts: () => d3.selectAll('text[data-state]').attr('opacity', 0.3),
    paths: () => d3.selectAll('path[data-startState]').attr('stroke-opacity', opacities.strokeLight),
  },
};

const Reset = {
  all: {
    texts: () => d3.selectAll('text[data-state]').attr('opacity', opacities.textStandard),
    paths: () => d3.selectAll('path[data-startState]').attr('stroke-opacity', opacities.strokeStandard),
  },
};

const setOpacities = (d) => {
  d3.selectAll('text[data-state]').transition(50).attr('opacity', (text) => (text.state === d.startState ? opacities.textStandard : 0.3));
  d3.selectAll('path[data-startState]').transition(50).attr('stroke-opacity', (path) => {
    if (path.startState === d.startState) {
      return opacities.strokeHighlight;
    }
    if (path.endState === d.startState) {
      return opacities.strokeHighlight * 0.3;
    }
    return opacities.strokeLight;
  });
};

const SVGInteract = {
  mouseOut: () => {
    if (!window.locked) {
      resetView();
    } else {
      log('Not removing content due to window lock.');
    }
  },
};

const LinkInteract = {
  mouseOut: () => {
    if (!window.locked) {
      resetView();
    } else {
      log('Not removing content due to window lock.');
    }
  },

  mouseOver: (event, d) => {
    if (!window.locked) {
      setOpacities(d);

      const lastAvailableYear = getStatePaths(d.source.state, true);

      d3.select('div#displayState')
        .html(d.displayState)
        .style('top', `${lastAvailableYear.endPoint.y + margin.top}px`)
        .classed('d-none', false)
        .style('height', '0px')
        .style('text-align', 'center')
        .style('right', '5px');

      showTravels(d, d.startYear, d.endYear);

      const allConnectedStates = d3.selectAll('path[data-startState]').nodes()
        .filter((path) => (path.dataset.endState === d.startState))
        .map((path) => path.dataset.startState);

      showLegend(graph.color, {
        restrictStates: allConnectedStates,
        selected: d.startState,
      });
    }
  },

  click: (event, d, force = false) => {
    if (!window.locked && force === false) {
      setOpacities(d);
      showTravels(d);
      window.locked = d.startState;
      d3.select('div#lockIndicator').style('width', `${getVizContainer().width}px`);
      d3.select('body').classed('locked', true);
    } else if (window.locked || force === true) {
      d3.select('body').classed('locked', false);
      delete window.locked;
      resetView();
    }
  },
};
