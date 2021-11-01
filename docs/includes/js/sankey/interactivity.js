/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const displayState = (link) => d3.select('div#displayState')
  .html(link.displayState)
  .style('top', `${getStatePaths(link.source.state, true).endPoint.y + margin.top}px`)
  .classed('d-none', false)
  .style('height', '0px')
  .style('text-align', 'center')
  .style('left', 'calc(100% - 100px)');

const getConnectedStates = (link) => d3.selectAll('path[data-startState]').nodes()
  .filter((path) => (path.dataset.endState === link.startState))
  .map((path) => path.dataset.startState);

const getRelatedPaths = (link) => ({
  outgoing: {
    thisState: d3.selectAll(`path[data-endState="${link.startState}"][data-startState=${link.startState}]`),
    otherStates: d3.selectAll(`path[data-startState="${link.startState}"]:not([data-endState=${link.startState}])`),
  },
  incoming: {
    /* endState will always be startState */
    thisState: d3.selectAll(`path[data-endState="${link.startState}"][data-startState=${link.startState}]`),
    otherStates: d3.selectAll(`path[data-endState="${link.startState}"]:not([data-startState=${link.startState}])`),
  },
});

const getRelatedTexts = (link) => ({
  outgoing: {
    thisState: d3.selectAll(`text[data-state="${link.startState}"][data-year="${link.endYear}"]`),
    otherStates: d3.selectAll(`text[data-state][data-year="${link.endYear}"]:not([data-state="${link.startState}"])`),
  },
  incoming: {
    thisState: [],
    otherStates: [],
  },
});

const setOpacities = (link) => {
  const texts = getRelatedTexts(link);
  const paths = getRelatedPaths(link);
  log('*******');
  log(`paths from ${link.startYear}`, paths);
  log(`texts from ${link.startYear}`, texts);
  log('*******');

  d3.selectAll('text[data-state]').transition(50).attr('opacity', (text) => {
    if (text.state === link.startState) {
      return opacities.textStandard;
    }
    if ((text.state === link.endState && text.year === link.endYear)
      || (text.state === link.startState && text.year === link.endYear)) {
      return opacities.textStandard * 0.5;
    }
    return 0.1;
  });
  d3.selectAll('path[data-startState]').transition(50).attr('stroke-opacity', (path) => {
    if (path.startState === link.startState) {
      return opacities.strokeHighlight;
    }
    if (path.endState === link.startState) {
      return opacities.strokeHighlight * 0.3;
    }
    return opacities.strokeLight;
  });

  if (d3.select(`div#information-${link.startYear}`).classed('d-none')) {
    log('opacity set with no travels shown');
    showTravels(link, link.startYear, link.endYear);
  }
};

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

const View = {
  set: (link, restrictedToYear = false, timerid = undefined) => {
    window.viewSet = link.startState;
    log(window.viewSet);
    log('View.set called');
    if (restrictedToYear) {
      showTravels(link, link.startYear, link.endYear);
    } else {
      showTravels(link);
    }
    setOpacities(link);
    displayState(link);
    showLegend(graph.color, {
      restrictStates: getConnectedStates(link),
      selected: link.startState,
    });

    if (timerid) {
      clearTimeout(timerid);
    }

    timerid = setTimeout(() => { if (!window.viewSet && !window.locked) { log('window.viewSet is deleted (and no window.lock on), so resetting view'); View.reset(); } }, 1000);
  },

  reset: () => {
    delete window.viewSet;
    log('View.reset called');
    hideTravels();
    d3.select('div#legend').classed('d-none', true);
    d3.select('div#displayState').classed('d-none', true);
    Reset.all.texts();
    Reset.all.paths();
  },
};

const SVGInteract = {
  mouseOut: (evt) => {
    evt.stopPropagation();
    if (!window.locked) {
      View.reset();
    } else {
      log('Not removing content due to window lock.');
    }
  },
};

const WindowLock = {
  lock: (link) => {
    window.locked = link.startState;
    d3.select('div#lockIndicator').style('width', `${getVizContainer().width}px`);
    d3.select('body').classed('locked', true);
  },
  unlock: () => {
    d3.select('body').classed('locked', false);
    delete window.locked;
  },
};

const LinkInteract = {
  mouseOut: (event, link) => {
    log('mouseOut on link called.', link);
    if (!window.locked) {
      View.reset();
    } else {
      log('Not removing content due to window lock (mouseOut).');
    }
  },

  mouseOver: (event, link) => {
    log('mouseOver on link called.');
    if (!window.locked) {
      View.set(link, true);
    } else {
      log('Not removing content due to window lock (mouseOver).');
    }
  },

  click: (event, link, force = false) => {
    log('click on link called.');
    if (!window.locked && force === false) {
      View.set(link);
      WindowLock.lock(link);
    } else if (window.locked || force === true) {
      View.reset();
      WindowLock.unlock();
    }
  },
};
