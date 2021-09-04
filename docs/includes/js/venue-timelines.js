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
        performerToSlug[_data[slug]] = slug
    });
}).then(() => {
    showScale()
    Object.keys(data).forEach(venue => showTimeline(venue));
    [...document.querySelectorAll('svg.timeline:not([data-processed])')].forEach(elem=>{
        console.warn(elem, 'not processed!')
    })
});


showTimeline = (venue) => {
    slug = performerToSlug[venue]
    artistData = data[venue]
    let svg = d3.select('svg[data-venue="'+slug+'"]')

    x = getCurrentXScale();

    yearClarify = svg.append('text').attr('x', 0).attr('y', 21)
    
    year = svg.selectAll('circle')
        .data(artistData)
        .join("circle")
        .attr("r", "5")
        .attr("fill", "steelblue")
        .attr("cx", d=>x(d))
        .attr("data-year", d=>d)
        .attr("cy", height/2)
        .style("cursor", "pointer")
        .attr("slug", slug);
    
    svg.attr("data-processed", 'true');

    year.on('mouseover', (evt, year)=>{
        d3.selectAll('circle[data-year]').attr('fill', 'steelblue')
        d3.selectAll('svg[data-venue] text').html('')
        circle = svg.select(`circle[data-year="${year}"]`)
        circle.attr("fill", 'orange')
        svg.select('text').html(year)
    });

    year.on('click', (evt, year)=> {
        circle = svg.select(`circle[data-year="${year}"]`)
        slug = circle.attr('slug')
        document.location = DATASET_URL + 'venue/' + slug
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
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', 'lightgray')
}

