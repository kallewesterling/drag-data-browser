function zoomed(event, d) {
    d3.select(this).attr("transform", event.transform);
}

svg = d3.select("svg#process")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 600 400");

svg = svg.append("g")
    .attr("transform", "translate(" + translate0 + ")scale(" + scale0 + ")")
    .call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed))
    .append("g");

svg.append("image")
    .attr("width",  "100%")
    .attr("height", imgHeight + "px")
    .attr("xlink:href", BASE_URL + 'includes/img/method-early-version.png');

