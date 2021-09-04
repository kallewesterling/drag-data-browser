const svg = d3.select('svg#network');

const width = getComputedStyle(d3.select("#vizContainer").node()).width.replace('px', '');
const height = 600;

const simulation = d3.forceSimulation();

g = svg
    .attr("width", width)
    .attr("height", height)
    .attr("class", "border my-4 w-100")
    .append("g")

var zoom = d3.zoom()
    .scaleExtent([0.2, 8])
    .on('zoom', function(event) {
        g
        .attr('transform', event.transform);
});

svg.call(zoom);

if (window.node_id) {
    let filename = `${DATA_DIR}individual-networks/${window.node_id}.json`;
    d3.json(filename).then( function( data) {
        const link = g
            .selectAll("line")
            .data(data.links)
            .join(
                enter => enter
                    .append("line")
                    .style("stroke", "rgba(0,0,0,0.2)")
                    .style("stroke-width", d => d.weights.venues)
            );

        const node = g
            .selectAll("circle")
            .data(data.nodes)
            .join(
                enter => enter
                    .append("circle")
                    .attr("r", 20)
                    .style("fill", d => d.node_id === window.node_id ? "rgba(255, 217, 102, 1)" : "rgba(255, 250, 237,1)")
                    .style("stroke", "rgb(204, 153, 0)")
                    .style("stroke-width", "0.5px")
            );


        const label = g
            .selectAll("text")
            .data(data.nodes)
            .join(
                enter => enter
                    .append("text")
                    .classed("user-select-none", true)
                    .attr("style", d=> d.node_id === window.node_id ? "font-weight: bold;" : "")
                    .attr('id', d=>d.node_id)
                    .html(d=>d.id));

        label
            .attr('width', (d) => document.querySelector(`text#${d.node_id}`).getBBox().width);

        const tick = () => {
            console.log('tick');
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            label.attr('x', d=>{
                let width = d3.select(`text#${d.node_id}`).attr("width");
                return d.x-width/2;
            });
            
            label.attr('y', d=>d.y);
        }
        simulation.nodes(data.nodes)
            .force("link", d3.forceLink()
                .id(d => d.id)
                .links(data.links)
            )
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .on("tick", tick);

            const dragged = d3
            .drag()
            .on("start", (event, node) => {
                node.fx = node.x;
                node.fy = node.y;
            })
            .on("drag", (event, node) => {
                d3.select(`circle#${node.node_id}`).raise();
                d3.select(`text[data-node=${node.node_id}]`).raise();
                node.fx = event.x;
                node.fy = event.y;
                tick();
            })
            .on("end", (event, node) => {
                node.fx = null;
                node.fy = null;
            })
            node.call(dragged);
            label.call(dragged);

    }).catch((e)=>{
        if (e.message.includes('404')) {
            console.error(`The file could not be found: ${filename}`);
            d3.select("section#viz").remove();
        } else {
            throw e;
        }
    });
}


getCurrentWidth = () => document.querySelector('#timelineContainer').getBoundingClientRect().width;

let getCurrentXScale = () => {
    dataExtent = [d3.min(Object.values(data))[0], d3.max(Object.values(data))[0]];
    return d3.scaleTime().range([20, getCurrentWidth()]).domain(dataExtent)
}

const data = {};
const slugToPerformer = {};
const performerToSlug = {};
performer = undefined;
slug = undefined;
artistData = undefined;

Promise.all([
    d3.json(DATA_DIR + 'years-active.json'),
    d3.json(DATA_DIR + 'performer-slugs.json'),
]).then((files)=>{
    _data = files[0]
    Object.keys(_data).forEach(k=>{
        data[k] = _data[k];
    });

    // performer slugs
    _data = files[1]
    Object.keys(_data).forEach(slug=>{
        slugToPerformer[slug] = _data[slug]
        performerToSlug[_data[slug]] = slug
    });
}).then(() => {
    performer = slugToPerformer[performerSlug];
    slug = performerToSlug[performer]
    artistData = data[performer]
    showScale();
});

showScale = () => {
    let svg = d3.select('svg#scale')
    scaleHeight = 40;
    x = getCurrentXScale();

    circle = svg.selectAll('circle')
        .data(d3.range(dataExtent[0],dataExtent[1]))
        .join("circle")
        .attr("r", "5")
        .attr("fill", d=>artistData.includes(d) ? "red" : "lightsteelblue")
        .attr("cx", d=>x(d))
        .attr("cy", scaleHeight/1.5)
        .style("cursor", d=>artistData.includes(d) ? "pointer" : "inherit");

    svg.selectAll('text')
        .data(d3.range(dataExtent[0],dataExtent[1]))
        .join("text")
        .attr('x', d=>x(d))
        .attr('y', d=>scaleHeight/2.5)
        .html(d=>d)
        .classed("user-select-none", true)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', d=>artistData.includes(d) ? "black" : "lightgray")
        .attr('font-weight', d=>artistData.includes(d) ? "bold" : "normal");

    circle.on('click', (evt, year)=> {
        document.location = BASE_URL + `continuous-performers/?name=${performer}`;
    });
}

