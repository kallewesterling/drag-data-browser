const bounds = () => {
  return document.querySelector("svg#viz").getBoundingClientRect();
}
const width = () => {
    return document.querySelector("svg#viz").getBoundingClientRect().width;
};

const height = () => {
    return document.querySelector("svg#viz").getBoundingClientRect().height;
};

const middle = (widthHeight = "width") => {
    if (widthHeight === "width") {
      return document.querySelector('svg#viz').getBoundingClientRect().width / 2;
    }
    return document.querySelector('svg#viz').getBoundingClientRect().height / 2;
}

const ticked = (d) => {
  store.node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
}

const hoverNode = (evt, n) => {
  d3.selectAll('svg#viz circle').style("fill-opacity", circle => (n === circle ? 1 : 0.3))
  d3.select("#popup")
      .html(n.name)
      .classed('d-none', false)
      .style('top', `${evt.clientY}px`)
      .style('left', `${evt.clientX}px`);
}

const hoverDoneNode = () => {
  d3.selectAll('svg#viz circle').style("fill-opacity", 0.7);
  d3.select("#popup")
        .html('')
        .classed('d-none', true)
        .style('top', 200)
        .style('left', 200);
}

svg = d3.select("svg#viz").attr("height", "500px");

let margins = { left: 150, right: 150 };


store = {
  x: d3.scaleOrdinal()
      .domain(["S", "U", "G"])
      .range([margins.left, middle(), width() - margins.right]),
  color: d3.scaleOrdinal()
      .domain(["S", "U", "G"])
      .range(["#F8766D", "#00BA38", "#619CFF"]),
  r: d3.scaleLinear()
      .range([3, 9]),
  simulation: d3.forceSimulation()
      .alphaDecay(0.06),
};

select = d3.select('#viz-container')
    .append('select')
    .attr('id', 'include')
    .lower()
    .on('change', (d)=> {
      draw();
    });

select.selectAll('option')
    .data([{'value': 'unnamed', 'label': 'include unnamed'}, {'value': 'no_unnamed', 'label': 'do not include unnamed'}])
    .join('option')
    .attr('value', d=>d.value)
    .attr('selected', d=>d.value==='no_unnamed')
    .html(d=>d.label);
nodeG = svg.append('g').attr('id', 'nodes')
labelG = svg.append('g').attr('id', 'labels')

labelG
  .selectAll("text")
  .data([
      { group: "S", label: "Only solo" },
      { group: "U", label: "Mix" },
      { group: "G", label: "Only group" },
  ])
  .join("text")
  .html((d) => d.label)
  .attr("x", (d) => store.x(d.group))
  .attr("y", 50)
  .attr("text-anchor", "middle")
  .style("font-size", "2em")
  .style("font-family", "Open Sans")
  .style("opacity", "0.1");


const filter = () => {
  console.log('filter called');
  includeUnnamed = d3.select('#include').node().value === 'unnamed';
  if (includeUnnamed) {
    store.filtered = store.data;
  } else {
    store.filtered = store.data.filter(d=>!d.name.toLowerCase().includes('unnamed'))
  }
  return store.filtered;
}

const draw = () => {
  console.log('draw called');
  store.filtered = filter();
  store.r.domain(d3.extent(store.filtered.map((n) => n.r)))

  // Initialize the circle: all located at the center of the svg area
  store.node = nodeG
      .selectAll("circle")
      .data(store.filtered)
      .join(
        enter => enter
            .append('circle')
            .attr("r", (d) => store.r(d.r))
            .attr("cx", middle())
            .attr("cy", middle("height"))
            .style("fill", (d) => store.color(d.group))
            .style("fill-opacity", 0.7)
            .on("mouseover", hoverNode)
            .on('mouseout', hoverDoneNode),
          update => update
            .style("fill", (d) => store.color(d.group))
            .attr("r", (d) => store.r(d.r)),
          exit => exit.transition().attr('r', 0).remove()
      );

  updateSimulation();
}

const updateSimulation = () => {
  store.simulation.nodes(store.filtered)

  xForce = d3.forceX()
            .x((d) => bounds().x + store.x(d.group))
            .strength(1);

  yForce = d3.forceY()
            .strength(0.15)
            .y(middle("height"));

  centerForce = d3.forceCenter()
            .x(middle() + bounds().x)
            .y(middle("height"))
            .strength(1.5)

  chargeForce = d3.forceManyBody()
            .strength(-4)
            .distanceMin(d3.min(store.r.range()))
            .distanceMax(200);

  collideForce = d3.forceCollide()
            .strength(2)
            .radius((n)=>store.r(n.r)*1.25)
            .iterations(1);

  store.simulation
      .force("x", xForce)
      .force("y", yForce)
      .force("center", centerForce)
      .force("charge", chargeForce)
      .force( "collide", collideForce);

  store.simulation.on("tick", ticked);

  store.simulation.alpha(1).restart();
}
d3.json(DATA_DIR + "clustering-v-individual.json")
  .then((data) => {
      store.data = data;
  })
  .then(() => {
      draw();
  });
