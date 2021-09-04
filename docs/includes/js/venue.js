getCurrentWidth = () => document.querySelector('#timelineContainer').getBoundingClientRect().width;

let getCurrentXScale = () => {
    dataExtent = [d3.min(Object.values(data))[0], d3.max(Object.values(data))[0]];
    return d3.scaleTime().range([20, getCurrentWidth()]).domain(dataExtent)
}

const data = {};
const slugToPerformer = {};
const venueToSlug = {};
venue = undefined;
slug = undefined;
artistData = undefined;

Promise.all([
    d3.json(DATA_DIR + 'years-active-venues.json'),
    d3.json(DATA_DIR + 'venue-slugs.json'),
]).then((files)=>{
    _data = files[0]
    Object.keys(_data).forEach(k=>{
        data[k] = _data[k];
    });

    // venue slugs
    _data = files[1]
    Object.keys(_data).forEach(slug=>{
        slugToPerformer[slug] = _data[slug]
        venueToSlug[_data[slug]] = slug
    });
}).then(() => {
    venue = slugToPerformer[venueSlug];
    slug = venueToSlug[venue]
    artistData = data[venue]
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
        .style("cursor", d=>artistData.includes(d) ? "inherit" : "inherit");

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
}

