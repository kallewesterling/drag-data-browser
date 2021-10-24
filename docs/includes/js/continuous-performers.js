/* eslint-disable no-undef */

const store = {
  data: {},
  dataDetail: {},
  rawData: {},
  oneMonth: 0,
  scales: {},
  allPerformers: [],
};

const STANDARD_CIRCLE = 1.5;
const PADDINGS = [0, 1, 2, 3, 4, 5];

// parse the date / time
const dateParser = d3.timeParse('%Y-%m-%d');
const popup = d3.select('div#popup');
const displayNum = popup.select('div#displayNum');

// setup standard sizes for the svgs
const margin = () => ({
  top: 20, right: 20, bottom: 40, left: 40,
});
const width = () => {
  const vizContainer = getComputedStyle(document.querySelector('#viz-container'));
  const vizContainerWidth = vizContainer.width.replace('px', '');
  const paddingLeft = vizContainer.paddingLeft.replace('px', '');
  const paddingRight = vizContainer.paddingRight.replace('px', '');
  const returnVal = vizContainerWidth - paddingLeft - paddingRight - margin().left - margin().right;
  return returnVal;
};
const height = () => 300 - margin().top - margin().bottom;

const getScale = (xOrY, padding) => {
  const localData = store.data[`padding${padding}`];
  if (xOrY === 'x') {
    return d3.scaleTime().range([0, width()]).domain(d3.extent(localData, (d) => d.date));
  } if (xOrY === 'y') {
    return d3.scaleLinear()
      .range([height(), 0])
      .domain([0, d3.max(localData, (d) => d.num_artists)]);
  }
  throw new Error('NOPE');
};

const searchPerformer = (name) => {
  const found = {};
  PADDINGS.forEach((padding) => {
    const years = Object.keys(store.dataDetail[`padding${padding}`]);
    years.forEach((year) => {
      const months = Object.keys(store.dataDetail[`padding${padding}`][year]);
      months.forEach((month) => {
        const performers = store.dataDetail[`padding${padding}`][year][month];
        if (performers.includes(name)) {
          if (!Object.keys(found).includes(`padding${padding}`)) {
            found[`padding${padding}`] = [];
          }
          if (!found[`padding${padding}`].includes(`${year},${month}`)) {
            found[`padding${padding}`].push(`${year},${month}`);
          }
        }
      });
    });
  });
  return found;
};

const markFound = (found, paddings, performerName, clearFirst = true) => {
  if (typeof paddings === 'number') {
    paddings = [paddings];
  }
  if (clearFirst) {
    paddings.forEach((padding) => {
      d3.selectAll(`svg#padding${padding} g.circles circle`).classed('selected', false).attr('r', STANDARD_CIRCLE);
      d3.selectAll(`svg#padding${padding} .foundPerformer`).classed('hidden', true);
    });
  }
  paddings.forEach((padding) => {
    found.forEach((f) => {
      const [year, month] = f.split(',');
      d3.select(`svg#padding${padding} g.circles circle#${month}-${year}`).classed('selected', true).transition().duration(1000)
        .attr('r', 5);
    });
    d3.selectAll(`svg#padding${padding} .foundPerformer`).classed('hidden', false);
    d3.selectAll(`svg#padding${padding}`).attr('data-performer', performerName);
  });
};

const searchPerformerAcrossAll = (name) => {
  const found = searchPerformer(name);
  PADDINGS.forEach((padding) => {
    markFound(found[`padding${padding}`], padding, name);
  });
};

const getDetailData = (padding, year, month) => store.dataDetail[`padding${padding}`][year][month].sort();

const showPerformers = (padding, dataPoint, highlightName) => {
  const performers = getDetailData(padding, dataPoint.year, dataPoint.month);
  d3.selectAll('.performer-lists').classed('d-none', true);
  let html = '';
  performers.forEach((performer) => {
    if (highlightName === performer) {
      html += `<span class="d-inline-block px-2 py-1 rounded-3 bg-danger m-1"><a class="text-white text-decoration-none" href="?name=${performer}">${performer}</a></span>`;
    } else {
      html += `<span class="d-inline-block px-2 py-1 rounded-3 bg-dark m-1"><a class="text-white text-decoration-none" href="?name=${performer}">${performer}</a></span>`;
    }
  });
  d3.select(`#performers-${padding}`).html(html);
  d3.select(`#performers-${padding}`).classed('d-none', false);
};

const reverseData = (localData, datePoint) => {
  const bisect = d3.bisector((d) => d.date).right;
  const ix = bisect(localData, datePoint);
  return localData[ix];
};

const mouseClick = (loc, event, padding) => {
  const highlightName = d3.select(`svg#padding${padding}`).attr('data-performer');
  const data = store.data[`padding${padding}`];
  const [xLoc, yLoc] = loc;
  const xScale = getScale('x', padding);
  const datePoint = xScale.invert(xLoc);
  const dataPoint = reverseData(data, datePoint);
  showPerformers(padding, dataPoint, highlightName);
};

const getLegend = (padding) => {
  switch (padding) {
    case 0:
      return 'Number of performers performing within a given month';
    case 1:
      return 'Number of performers normalized from the surrounding 3-month period (± 1mo)';
    case 2:
      return 'Number of performers normalized from the surrounding 5-month period (± 2mo)';
    case 3:
      return 'Number of performers normalized from the surrounding 7-month period (± 3mo)';
    case 4:
      return 'Number of performers normalized from the surrounding 9-month period (± 4mo)';
    case 5:
      return 'Number of performers normalized from the surrounding 11-month period (± 5mo)';
    default:
      throw new Error('Padding cannot be interpreted.');
  }
};

const makeLegend = (padding) => {
  let svg = d3.select(`svg#padding${padding}`);

  svg = svg.select(`g#padding-${padding}`);

  if (svg.select('g.legend').node()) {
    // console.log('legend already exists')
    return true;
  }

  const legend = svg
    .append('g')
    .attr('class', 'legend');

  legend.append('circle')
    .attr('cx', 30 + 5)
    .attr('cy', 30)
    .attr('r', 5)
    .classed('foundPerformer', true)
    .classed('hidden', true)
    .style('fill', 'red');

  legend.append('rect')
    .attr('x', 30)
    .attr('y', (d, i) => i * 20)
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', 'steelblue');

  legend.append('text')
    .attr('x', 45)
    .attr('y', () => 30 + 5)
    .text(() => 'Month when performer appears in dataset')
    .classed('foundPerformer', true)
    .classed('hidden', true)
    .classed('legendText', true);

  legend.append('text')
    .attr('x', 45)
    .attr('y', (d, i) => (i * 20) + 9)
    .text(() => getLegend(padding))
    .attr('class', 'legendText');

  return true;
};

const makeAxes = (padding) => {
  const svg = d3.select(`svg#padding${padding} g#padding-${padding}`);

  const xScale = getScale('x', padding);
  const yScale = getScale('y', padding);

  if (!svg.select(`g.xScale-${padding}`).node()) {
    svg.append('g')
      .attr('class', `xScale-${padding}`)
      .attr('transform', `translate(0,${height()})`)
      .call(d3.axisBottom(xScale));
  } else {
    svg.select(`g.xScale-${padding}`)
      .attr('transform', `translate(0,${height()})`)
      .call(d3.axisBottom(xScale));
  }

  // add y Axis
  if (!svg.select(`g.yScale-${padding}`).node()) {
    svg.append('g')
      .attr('class', `yScale-${padding}`)
      .call(d3.axisLeft(yScale));
  } else {
    svg.select(`g.yScale-${padding}`)
      .call(d3.axisLeft(yScale));
  }
};

const makeMouseLine = (padding) => {
  const svg = d3.select(`svg#padding${padding} g#padding-${padding}`);

  if (svg.select(`g.mouse-over-effects-${padding}`).node()) {
    return true;
  }

  svg.append('g')
    .attr('class', `mouse-over-effects-${padding}`);

  d3.select(`g.mouse-over-effects-${padding}`)
    .append('path') // this is the black vertical line to follow mouse
    .attr('class', `mouse-line-${padding}`)
    .style('stroke-width', `${store.oneMonth}px`) // * months
    .style('opacity', '0');

  d3.select(`g.mouse-over-effects-${padding}`)
    .append('svg:rect') // append a rect to catch mouse movements on canvas
    .attr('width', width()) // can't catch mouse events on a g element
    .attr('height', height())
    .attr('fill', 'none')
    .attr('pointer-events', 'all');

  return true;
};

const renderContinousPerformanceData = (padding = 0) => {
  let svg = '';
  if (d3.select(`svg#padding${padding} g#padding-${padding}`).node()) {
    // console.log('found existing svg with padding', padding)
    svg = d3.select(`svg#padding${padding}`)
      .attr('width', width() + margin().left + margin().right)
      .attr('height', height() + margin().top + margin().bottom);
    svg = svg.select(`g#padding-${padding}`);
  } else {
    svg = d3.select(`svg#padding${padding}`)
      .attr('width', width() + margin().left + margin().right)
      .attr('height', height() + margin().top + margin().bottom)
      .append('g')
      .attr('id', `padding-${padding}`)
      .attr('transform', `translate(${margin().left},${margin().top})`);
  }

  const data = store.data[`padding${padding}`];

  // set the ranges
  const xScale = getScale('x', padding);
  const yScale = getScale('y', padding);

  store.oneMonth = xScale(dateParser('1930-02-01')) - xScale(dateParser('1930-01-01'));

  // define the line
  const valueline = d3.line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.num_artists));

  // draw our two main lines
  const pathGroup = svg
    .selectAll('g.paths')
    .data([data])
    .join((enter) => enter.append('g')
      .attr('class', 'paths'));

  const line = pathGroup
    .selectAll('path.line')
    .data([data])
    .join(
      (enter) => enter.append('path')
        .attr('d', valueline),
      (update) => update
        .attr('d', valueline),
    );

  line
    .attr('class', 'line');

  const shadowLine = pathGroup
    .selectAll('path.shadowLine')
    .data([data])
    .join(
      (enter) => enter
        .append('path')
        .attr('d', valueline),
      (update) => update
        .attr('d', valueline),
    );

  shadowLine
    .attr('class', 'shadowLine')
    .attr('transform', 'translate(2 2)');

  // add circles
  const circleGroup = svg
    .selectAll('g.circles')
    .data([data])
    .join(
      (enter) => enter
        .append('g')
        .attr('class', 'circles'),
    );

  const circle = circleGroup
    .selectAll('circle')
    .data(data)
    .join(
      (enter) => enter
        .append('circle'),
      (update) => update,
    );

  circle
    .attr('class', 'node')
    .attr('r', STANDARD_CIRCLE)
    .attr('cx', (d) => xScale(d.date))
    .attr('cy', (d) => yScale(d.num_artists))
    .attr('id', (d) => `${d.month}-${d.year}`);

  // make both axes
  makeAxes(padding);

  // make legend
  makeLegend(padding);

  makeMouseLine(padding);
};

const getMonthRange = (month, year, range) => {
  switch (month) {
    case 'Jan':
      switch (range) {
        case 0:
          return `<strong>Jan 1–31, ${year}</strong>`;
        case 1:
          return `<strong>Jan</strong><br/>normalized over<br/>Dec ${year - 1}–Feb ${year}`;
        case 2:
          return `<strong>Jan</strong><br/>normalized over<br/>Nov ${year - 1}–Mar ${year}`;
        case 3:
          return `<strong>Jan</strong><br/>normalized over<br/>Oct ${year - 1}–Apr ${year}`;
        case 4:
          return `<strong>Jan</strong><br/>normalized over<br/>Sep ${year - 1}–May ${year}`;
        case 5:
          return `<strong>Jan</strong><br/>normalized over<br/>Aug ${year - 1}–Jun ${year}`;
        default:
          throw new Error('Cannot understand range');
      }
    case 'Feb':
      switch (range) {
        case 0:
          return `<strong>Feb 1–28, ${year}</strong>`;
        case 1:
          return `<strong>Feb</strong><br/>normalized over<br/>Jan–Mar ${year}`;
        case 2:
          return `<strong>Feb</strong><br/>normalized over<br/>Dec ${year - 1}–Apr ${year}`;
        case 3:
          return `<strong>Feb</strong><br/>normalized over<br/>Nov ${year - 1}–May ${year}`;
        case 4:
          return `<strong>Feb</strong><br/>normalized over<br/>Oct ${year - 1}–Jun ${year}`;
        case 5:
          return `<strong>Feb</strong><br/>normalized over<br/>Sep ${year - 1}–Jul ${year}`;
        default:
          throw new Error('Cannot understand range');
      }
    case 'Mar':
      switch (range) {
        case 0:
          return `<strong>Mar 1–31, ${year}</strong>`;
        case 1:
          return `<strong>Mar</strong><br/>normalized over<br/>Feb–Apr ${year}`;
        case 2:
          return `<strong>Mar</strong><br/>normalized over<br/>Jan–May ${year}`;
        case 3:
          return `<strong>Mar</strong><br/>normalized over<br/>Dec ${year - 1}–Jun ${year}`;
        case 4:
          return `<strong>Mar</strong><br/>normalized over<br/>Nov ${year - 1}–Jul ${year}`;
        case 5:
          return `<strong>Mar</strong><br/>normalized over<br/>Oct ${year - 1}–Aug ${year}`;
        default:
          throw new Error('Cannot understand range');
      }
    case 'Apr':
      switch (range) {
        case 0:
          return `<strong>Apr 1–30, ${year}</strong>`;
        case 1:
          return `<strong>Apr</strong><br/>normalized over<br/>Mar–May ${year}`;
        case 2:
          return `<strong>Apr</strong><br/>normalized over<br/>Feb–Jun ${year}`;
        case 3:
          return `<strong>Apr</strong><br/>normalized over<br/>Jan–Jul ${year}`;
        case 4:
          return `<strong>Apr</strong><br/>normalized over<br/>Dec ${year - 1}–Aug ${year}`;
        case 5:
          return `<strong>Apr</strong><br/>normalized over<br/>Nov ${year - 1}–Sep ${year}`;
        default:
          throw new Error('Cannot understand range');
      }
    case 'May':
      switch (range) {
        case 0:
          return `<strong>May 1–31, ${year}</strong>`;
        case 1:
          return `<strong>May</strong><br/>normalized over<br/>Apr–Jun ${year}`;
        case 2:
          return `<strong>May</strong><br/>normalized over<br/>Mar–Jul ${year}`;
        case 3:
          return `<strong>May</strong><br/>normalized over<br/>Feb–Aug ${year}`;
        case 4:
          return `<strong>May</strong><br/>normalized over<br/>Jan–Sep ${year}`;
        case 5:
          return `<strong>May</strong><br/>normalized over<br/>Dec ${year - 1}–Oct ${year}`;
        default:
          throw new Error('Cannot understand range');
      }
    case 'Jun':
      switch (range) {
        case 0:
          return `<strong>Jun 1–30, ${year}</strong>`;
        case 1:
          return `<strong>Jun</strong><br/>normalized over<br/>May–Jul ${year}`;
        case 2:
          return `<strong>Jun</strong><br/>normalized over<br/>Apr–Aug ${year}`;
        case 3:
          return `<strong>Jun</strong><br/>normalized over<br/>Mar–Sep ${year}`;
        case 4:
          return `<strong>Jun</strong><br/>normalized over<br/>Feb–Oct ${year}`;
        case 5:
          return `<strong>Jun</strong><br/>normalized over<br/>Jan–Nov ${year}`;
        default:
          throw new Error('Cannot understand range');
      }
    case 'Jul':
      switch (range) {
        case 0:
          return `<strong>Jul 1–31, ${year}</strong>`;
        case 1:
          return `<strong>Jul</strong><br/>normalized over<br/>Jun–Aug ${year}`;
        case 2:
          return `<strong>Jul</strong><br/>normalized over<br/>May–Sep ${year}`;
        case 3:
          return `<strong>Jul</strong><br/>normalized over<br/>Apr–Oct ${year}`;
        case 4:
          return `<strong>Jul</strong><br/>normalized over<br/>Mar–Nov ${year}`;
        case 5:
          return `<strong>Jul</strong><br/>normalized over<br/>Feb–Dec ${year}`;
        default:
          throw new Error('Cannot understand range');
      }
    case 'Aug':
      switch (range) {
        case 0:
          return `<strong>Aug 1–31, ${year}</strong>`;
        case 1:
          return `<strong>Aug</strong><br/>normalized over<br/>Jul–Sep ${year}`;
        case 2:
          return `<strong>Aug</strong><br/>normalized over<br/>Jun–Oct ${year}`;
        case 3:
          return `<strong>Aug</strong><br/>normalized over<br/>May–Nov ${year}`;
        case 4:
          return `<strong>Aug</strong><br/>normalized over<br/>Apr–Dec ${year}`;
        case 5:
          return `<strong>Aug</strong><br/>normalized over<br/>Mar ${year}–Jan ${year + 1}`;
        default:
          throw new Error('Cannot understand range');
      }
    case 'Sep':
      switch (range) {
        case 0:
          return `<strong>Sep 1–30, ${year}</strong>`;
        case 1:
          return `<strong>Sep</strong><br/>normalized over<br/>Aug–Oct ${year}`;
        case 2:
          return `<strong>Sep</strong><br/>normalized over<br/>Jul–Nov ${year}`;
        case 3:
          return `<strong>Sep</strong><br/>normalized over<br/>Jun–Dec ${year}`;
        case 4:
          return `<strong>Sep</strong><br/>normalized over<br/>May ${year}–Jan ${year + 1}`;
        case 5:
          return `<strong>Sep</strong><br/>normalized over<br/>Apr ${year}–Feb ${year + 1}`;
        default:
          throw new Error('Cannot understand range');
      }
    case 'Oct':
      switch (range) {
        case 0:
          return `<strong>Oct 1–31, ${year}</strong>`;
        case 1:
          return `<strong>Oct</strong><br/>normalized over<br/>Sep–Nov ${year}`;
        case 2:
          return `<strong>Oct</strong><br/>normalized over<br/>Aug–Dec ${year}`;
        case 3:
          return `<strong>Oct</strong><br/>normalized over<br/>Jul ${year}–Jan ${year + 1}`;
        case 4:
          return `<strong>Oct</strong><br/>normalized over<br/>Jun ${year}–Feb ${year + 1}`;
        case 5:
          return `<strong>Oct</strong><br/>normalized over<br/>May ${year}–Mar ${year + 1}`;
        default:
          throw new Error('Cannot understand range');
      }
    case 'Nov':
      switch (range) {
        case 0:
          return `<strong>Nov 1–30, ${year}</strong>`;
        case 1:
          return `<strong>Nov</strong><br/>normalized over<br/>Oct–Dec ${year}`;
        case 2:
          return `<strong>Nov</strong><br/>normalized over<br/>Sep ${year}–Jan ${year + 1}`;
        case 3:
          return `<strong>Nov</strong><br/>normalized over<br/>Aug ${year}–Feb ${year + 1}`;
        case 4:
          return `<strong>Nov</strong><br/>normalized over<br/>Jul ${year}–Mar ${year + 1}`;
        case 5:
          return `<strong>Nov</strong><br/>normalized over<br/>Jun ${year}–Apr ${year + 1}`;
        default:
          throw new Error('Cannot understand range');
      }
    case 'Dec':
      switch (range) {
        case 0:
          return `<strong>Dec 1–31, ${year}</strong>`;
        case 1:
          return `<strong>Dec</strong><br/>normalized over<br/>Nov ${year}–Jan ${year + 1}`;
        case 2:
          return `<strong>Dec</strong><br/>normalized over<br/>Oct ${year}–Feb ${year + 1}`;
        case 3:
          return `<strong>Dec</strong><br/>normalized over<br/>Sep ${year}–Mar ${year + 1}`;
        case 4:
          return `<strong>Dec</strong><br/>normalized over<br/>Aug ${year}–Apr ${year + 1}`;
        case 5:
          return `<strong>Dec</strong><br/>normalized over<br/>Jul ${year}–May ${year + 1}`;
        default:
          throw new Error('Cannot understand range');
      }

    default:
      throw new Error('Cannot understand month');
  }
};

const getText = (dataPoint, padding) => `${getMonthRange(dataPoint.month, dataPoint.year, padding)}:<br/>${dataPoint.num_artists}`;

const mouseEvent = (onOff, padding) => {
  if (onOff) {
    d3.select(`.mouse-line-${padding}`)
      .style('opacity', '1');
    popup.classed('d-none', false);
  } else {
    d3.select(`.mouse-line-${padding}`)
      .style('opacity', '0');
    popup.classed('d-none', true);
  }
};

const mouseMove = (loc, event, snap = false, padding) => {
  const data = store.data[`padding${padding}`];
  [xLoc, yLoc] = loc;
  const xScale = getScale('x', padding);
  const datePoint = xScale.invert(xLoc);
  const dataPoint = reverseData(data, datePoint);

  if (event.buttons === 1) {
    showPerformers(padding, dataPoint);
  }

  const xLocSnap = xScale(dataPoint.date);
  if (snap) {
    d3.select(`.mouse-line-${padding}`).attr('d', `M${xLocSnap},${height() + margin().top} ${xLocSnap},${-margin().top}`); // set correct X on mouseline
  } else {
    d3.select(`.mouse-line-${padding}`).attr('d', `M${xLoc},${height() + margin().top} ${xLoc},${-margin().top}`); // set correct X on mouseline
  }

  if (dataPoint.num_artists) {
    displayNum.html(getText(dataPoint, padding));
    popup.classed('d-none', false);

    const xOffset = getComputedStyle(d3.select('#popup').node()).width.replace('px', '') / 2;
    yLoc = d3.select(`svg#padding${padding} g.xScale-${padding}`).node().getBoundingClientRect().top;

    popup.attr('style', `left: ${event.clientX - xOffset}px; top: ${yLoc}px`);
  }
};

const setupInteractivity = (padding) => {
  d3.select(`g .mouse-over-effects-${padding} rect`)
    .on('mouseout', () => mouseEvent(false, padding))
    .on('mouseover', () => mouseEvent(true, padding))
    .on('mousemove', (evt) => mouseMove(d3.pointer(evt), evt, true, padding))
  // .on('mousedown', (evt) => {console.log('mousedown')})
    .on('click', (evt) => mouseClick(d3.pointer(evt), evt, true, padding));
};

const addDataToTables = (padding) => {
  let data = store.data[`padding${padding}`];
  data = data.filter((d) => d.year >= 1930 && d.year <= 1940);
  function tabulate(tableData, columns) {
    const table = d3.select(`table#padding${padding}`);
    const thead = table.select('thead');
    const tbody = table.select('tbody');

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
      .text((column) => column);

    // create a row for each object in the data
    const rows = tbody.selectAll('tr')
      .data(tableData)
      .enter()
      .append('tr');

    // create a cell in each row for each column
    rows.selectAll('td')
      .data((row) => columns.map((column) => ({ column, value: row[column] })))
      .enter()
      .append('td')
      .attr('class', 'p-2')
      .text((d) => d.value);

    return table;
  }

  // render the table(s)
  tabulate(data, ['year', 'month', 'num_artists']); // 2 column table
};

const countPerformer = (name, padding = 1) => {
  let results = 0;
  Object.keys(store.dataDetail[`padding${padding}`]).forEach((year) => {
    Object.keys(store.dataDetail[`padding${padding}`][year]).forEach((month) => {
      if (store.dataDetail[`padding${padding}`][year][month].includes(name)) { results += 1; }
    });
  });
  return results;
};

const sortPerformersByCount = (padding = 1, reverse = false) => {
  if (reverse) {
    return store.allPerformers
      .sort((a, b) => (countPerformer(a, padding) > countPerformer(b, padding) ? -1 : 1));
  }

  return store.allPerformers
    .sort((a, b) => (countPerformer(a, padding) > countPerformer(b, padding) ? 1 : -1));
};

const addOptions = (padding) => {
  const dropDown = d3.select(`#padding${padding}-filter`);
  const filterAll = d3.select(`#padding${padding}-filter-all`);

  const options = dropDown.selectAll('option')
    .data(['', ...sortPerformersByCount(padding, true)])
    .join(
      (enter) => enter
        .append('option'),
      (update) => update,
      (exit) => exit.remove(),
    );

  options.text((d) => d)
    .attr('value', (d) => d)
    .html((d) => (d ? `${d} (${countPerformer(d, padding)})` : ''));

  dropDown.on('change', () => {
    const performerName = dropDown.node().value;
    if (performerName === '') {
      filterAll.classed('d-none', true);
      d3.selectAll(`svg#padding${padding} g.circles circle`).classed('selected', false).attr('r', STANDARD_CIRCLE);
    } else {
      const found = searchPerformer(performerName)[`padding${padding}`];
      markFound(found, padding, performerName);
      filterAll.classed('d-none', false);
      d3.select(`#padding${padding}-filter-all a`).attr('href', `${window.location.pathname}?name=${performerName}`);
    }
  });
};

const loader = [];
PADDINGS.forEach((padding) => {
  loader.push(d3.json(`${DATA_DIR}/continuous-performances-padding-${padding}.json`));
});

const detailLoader = [];
PADDINGS.forEach((padding) => {
  detailLoader.push(d3.json(`${DATA_DIR}/continuous-performances-padding-${padding}-detail.json`));
});

Promise.all(loader).then((files) => {
  PADDINGS.forEach((padding) => {
    files[padding].forEach((d) => { if (typeof d.date === 'string') { d.date = dateParser(d.date); } }); // fix dates
    store.data[`padding${padding}`] = files[padding].filter((d) => d.date.getFullYear() >= 1930 && d.date.getFullYear() < 1940);
  });
}).then(() => {
  Promise.all(detailLoader).then((files) => {
    PADDINGS.forEach((padding) => {
      store.dataDetail[`padding${padding}`] = files[padding];
    });
  }).catch((err) => {
    throw new Error(err);
  }).then(() => {
    Object.keys(store.data).forEach((key) => {
      const padding = +key.replace('padding', '');
      renderContinousPerformanceData(padding);
      setupInteractivity(padding);
      addDataToTables(padding);

      const data = store.dataDetail[`padding${padding}`];
      Object.keys(data).forEach((year) => {
        Object.keys(data[year]).forEach((month) => {
          data[year][month].forEach((performer) => {
            if (!store.allPerformers.includes(performer)) { store.allPerformers.push(performer); }
          });
        });
      });
      store.allPerformers.sort();

      addOptions(padding);
    });
  })
    .then(() => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      if (params.name) {
        window.searchName = params.name;
        searchPerformerAcrossAll(params.name);
        PADDINGS.forEach((padding) => {
          d3.select(`#padding${padding}-filter`).node().value = params.name;
        });
      }
    });
}).catch((err) => {
  throw new Error(err);
});

window.addEventListener('resize', () => {
  PADDINGS.forEach((padding) => {
    renderContinousPerformanceData(padding);
  });
});
