// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 1020,
    height = 600;

// append the svg object to the body of the page
var svg = d3.select("#communities")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var g = svg.append("g")
    .attr("viewBox", [0, 0, width, height])

const store = {}

d3.json(DATA_DIR + `v1-14-days-filtered-node-weight-distributions.json`).then(data=>{
    columns = Object.keys(data[0]).filter(k=>k !== 'name')
    data = {
        y: "Numbers of communities",
        x: "Min weight",
        series: data.map(d=>({
            name: d.name,
            values: columns.map(k=>d[k])
        })),
        weights: columns.map(k=>k.replace('weight-', ''))
    }
    store.data = data;

    let svg = d3.select('svg#communities');

    // draw
    line = d3.line()
        .defined(d => !isNaN(d))
        .x((d, i) => {
            return x(data.weights[i]);
        })
        .y(d => {
            return y(d);
        });

    const y = d3.scaleLinear()
        .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
        .range([height - margin.bottom, margin.top]);

    const x = d3.scalePoint()
        .domain(data.weights)
        .range([margin.left, width - margin.right]);
    
    const invertX = (xm) => {
        var domain = x.domain(); 
        var range = x.range();
        var rangePoints = d3.range(range[0], range[1], x.step());
        weightIndex = d3.bisectLeft(rangePoints, xm);
        var xPos = domain[weightIndex];
        return xPos;
    }
    
    yAxis = (g) => g.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y))
            
    xAxis = (g) => g.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(
            d3.axisBottom(x)
            .tickValues(
                x
                    .domain()
                    .filter((d, i) => i % 5 === 0) // every fifth value from the domain
            )
        )
        .call(g => g.select(".tick:last-of-type text").clone()
        .attr("y", 30)
        .attr("x", 0)
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .text(data.x))

    xAxis(g)
    yAxis(g)

    const path_g = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        
    const path = path_g.selectAll("path")
        .data(data.series)
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("stroke", "steelblue")
        .attr("d", d => line(d.values));

    const dot = svg.append("g")
        .attr("display", "none");

    dot.append("circle")
        .attr("r", 2.5);

    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -8);
    
    var rect = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")    
        .style("pointer-events", "all")
        
    rect.call(hover, path);

    function hover(svg, path) {
        if ("ontouchstart" in document) {
            svg
                .style("-webkit-tap-highlight-color", "transparent")
                .on("touchmove", moved)
                .on("touchstart", entered)
                .on("touchend", left)
        } else {
            svg
                .on("mousemove", moved)
                .on("mouseenter", entered)
                .on("mouseleave", left);
        }
        
        function moved(event) {
            event.preventDefault();
            
            const pointer = d3.pointer(event, this);
            const xm = invertX(pointer[0]-margin.left/2);
            const ym = y.invert(pointer[1]);
            const i = d3.bisect(data.weights, xm);
            const s = d3.least(data.series, d => Math.abs(d.values[i] - ym));
            
            if (s) {
                path.attr("stroke", d => d === s ? "steelblue" : "#eee").filter(d => d === s).raise();
                dot.attr("transform", `translate(${x(data.weights[i])},${y(s.values[i])})`);
                dot.select("text").text(`${s.name}: ${s.values[i]} communities`);
            }
        }

        function entered() {
            path.style("mix-blend-mode", null).attr("stroke", "#eee");
            dot.attr("display", null);
        }

        function left() {
            path.style("mix-blend-mode", "multiply").attr("stroke", "steelblue");
            dot.attr("display", "none");
        }
    }
});
