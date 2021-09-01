const svg = d3.select('svg#network');

const width = getComputedStyle(d3.select("#content .container").node()).width.replace('px', '');
const height = 400;

const simulation = d3.forceSimulation;

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
                    .style("fill", d => d.node_id === window.node_id ? "rgba(255, 217, 102)" : "rgba(255, 242, 204)")
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
                    .attr('id', d=>d.node_id)
                    .html(d=>d.id));

        label
            .attr('width', (d) => document.querySelector(`text#${d.node_id}`).getBBox().width);

        simulation(data.nodes)
            .force("link", d3.forceLink()
                .id(d => d.id)
                .links(data.links)
            )
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .on("tick", tick);
        
        function tick() {
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

    }).catch((e)=>{
        if (e.message.includes('404')) {
            console.error(`The file could not be found: ${filename}`);
            d3.select("section#viz").remove();
        } else {
            throw e;
        }
    });
}