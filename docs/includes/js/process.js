function zoomed(event, d) {
    d3.select(this).attr("transform", event.transform);
}

svg = d3.select("svg#process")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 600 400");

svg = svg.append("g")
    .attr("transform", "translate(0,0) scale(0.6)")
    .call(d3.zoom().scaleExtent([0.1, 8]).on("zoom", zoomed))
    .append("g");

svg.append("image")
    .attr("width",  "100%")
    .attr("height", "400px")
    .attr("xlink:href", BASE_URL + 'includes/img/method-early-version.png');

