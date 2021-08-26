function zoom() {
    svg.attr("transform", d3.event.transform);
    console.log("translate: " + d3.event.translate + ", scale: " + d3.event.scale);
}

var imgHeight = 1025, imgWidth = 1538,      // Image dimensions (don't change these)
    width =  960, height = 650,             // Dimensions of cropped region
    translate0 = [-290, -180], scale0 = 1;  // Initial offset & scale

svg = d3.select("svg#process")
    .attr("width",  width + "px")
    .attr("height", height + "px");

svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width + "px")
    .attr("height", height + "px");

svg = svg.append("g")
    .attr("transform", "translate(" + translate0 + ")scale(" + scale0 + ")")
    .call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoom))
    .append("g");

svg.append("image")
    .attr("width",  imgWidth + "px")
    .attr("height", imgHeight + "px")
    .attr("xlink:href", BASE_URL + 'includes/img/method-early-version.png');
