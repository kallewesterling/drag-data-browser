const height = 30;

const data = {}
let dataExtent = []
const slugToPerformer = {}
const performerToSlug = {}

getCurrentWidth = () => document.querySelectorAll('th[scope=col]')[1].getBoundingClientRect().width;

let getCurrentXScale = () => {
    dataExtent = [d3.min(Object.values(data))[0], d3.max(Object.values(data))[0]];
    return d3.scaleTime().range([50, getCurrentWidth()]).domain(dataExtent)
}

Promise.all([
    d3.json(DATA_DIR + '/years-active.json'),
    d3.json(DATA_DIR + '/performer-slugs.json'),
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
    showScale()
    Object.keys(data).forEach(performer => showTimeline(performer));
    [...document.querySelectorAll('svg.timeline:not([data-processed])')].forEach(elem=>{
        console.warn(elem, 'not processed!')
    })
});


showTimeline = (performer) => {
    slug = performerToSlug[performer]
    artistData = data[performer]
    let svg = d3.select('svg[data-performer="'+slug+'"]')

    x = getCurrentXScale();

    yearClarify = svg.append('text').attr('x', 0).attr('y', 21).classed("user-select-none", true);
    
    year = svg.selectAll('circle')
        .data(artistData)
        .join("circle")
        .attr("r", "5")
        .attr("fill", "steelblue")
        .attr("cx", d=>x(d))
        .attr("data-year", d=>d)
        .attr("cy", height/2)
        .style("cursor", "pointer");
    
    svg.attr("data-processed", 'true');

    year.on('mouseover', (evt, year)=>{
        d3.selectAll('circle[data-year]').attr('fill', 'steelblue')
        d3.selectAll('svg[data-performer] text').html('')
        circle = svg.select(`circle[data-year="${year}"]`)
        circle.attr("fill", 'orange')
        svg.select('text').html(year)
    });

    year.on('click', (evt, year)=> {
        document.location = BASE_URL + `continuous-performers/?name=${performer}`;
    });
}

showScale = () => {
    let svg = d3.select('svg#scale')
    scaleHeight = 40;
    x = getCurrentXScale();

    svg.selectAll('circle')
        .data(d3.range(dataExtent[0],dataExtent[1]))
        .join("circle")
        .attr("r", "5")
        .attr("fill", "lightsteelblue")
        .attr("cx", d=>x(d))
        .attr("cy", scaleHeight/1.5);

    svg.selectAll('text')
        .data(d3.range(dataExtent[0],dataExtent[1]))
        .join("text")
        .attr('x', d=>x(d))
        .attr('y', d=>scaleHeight/2.5)
        .html(d=>d)
        .classed("user-select-none", true)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', 'lightgray');
}

