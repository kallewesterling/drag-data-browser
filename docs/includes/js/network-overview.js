const string_to_slug = (str) => {
    // from https://gist.github.com/codeguy/6684588
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}


var margin = {top: 10, right: 30, bottom: 60, left: 60},
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var store = {}

var svg = d3.select("svg#viz")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
    
var g = svg
    .append("g")
    .attr("id", "base")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var gX = undefined;
var gY = undefined;
var xAxis = undefined;
var yAxis = undefined;

mapping = {
    node_degrees: {
        explanation: 'This is the explanation for node degree.',
        human: 'Node degrees'
    },
    most_direct_edges: {
        explanation: 'This is the explanation for most direct edges.',
        human: 'Direct edges'
    },
    extended_node_network: {
        explanation: 'This is the explanation for extended_node_network.',
        human: 'Extended node network'
    },
    degree_centrality_overview: {
        explanation: 'This is the explanation for degree_centrality_overview.',
        human: 'Degree centrality'
    },
    betweenness_centrality_overview: {
        explanation: 'This is the explanation for betweenness_centrality_overview.',
        human: 'Betweenness centrality'
    },
    eigenvector_centrality_overview: {
        explanation: 'This is the explanation for eigenvector_centrality_overview.',
        human: 'Eigenvector centrality'
    },
    closeness_centrality_overview: {
        explanation: 'This is the explanation for closeness_centrality_overview.',
        human: 'Closeness centrality'
    },
    most_direct_neighbors: {
        explanation: 'This is the explanation for most_direct_neighbors.',
        human: 'Direct neighbors'
    }
}

const preselectOptions = (opts) => {
    let xChoiceOptions = [...document.querySelector('#xChoice').options]
    xChoiceOptions.forEach(option => {
        if (option.innerHTML === opts.x) {
            option.setAttribute('selected', '')
        }
    })
    let yChoiceOptions = [...document.querySelector('#yChoice').options]
    yChoiceOptions.forEach(option => {
        if (option.innerHTML === opts.y) {
            option.setAttribute('selected', '')
        }
    })
}


const getDotSize = () => {
    let currentValue = d3.select('#dotSize').node().value;
    d3.select('#dotSizeValue').html(currentValue);
    return currentValue;
}

d3.select('#dotSize').on('input', (evt) => changeChoices())
d3.select('#dotSize').on('change', (evt) => changeChoices())

const getValue = (human) => {
    value = Object.keys(mapping).filter(k=>{if (mapping[k].human === human) return true;})
    if (value.length)
        return value[0]
    return undefined
}

const changeChoices = () => {
    xVal = d3.select('select#xChoice').node().value;
    yVal = d3.select('select#yChoice').node().value;
    draw({xVal: xVal, yVal: yVal})
}

const setupOptions = () => {
    options_html = Object.keys(mapping);
    options = Object.keys(mapping).map(k=>{return mapping[k].human});

    xChoices = d3.select('select#xChoice').attr('class','select').selectAll('option').data(options).join('option').html(d=>d).attr('value', d=>getValue(d))
    yChoices = d3.select('select#yChoice').attr('class','select').selectAll('option').data(options).join('option').html(d=>d).attr('value', d=>getValue(d))
    d3.select('select#xChoice').on('change', changeChoices)
    d3.select('select#yChoice').on('change', changeChoices)
}

setupOptions();
preselectOptions({x: 'Node degrees', y: 'Direct edges'})

const getXScale = () => {
    return d3.scaleLinear()
        .domain(d3.extent(store.data, d=>d[xOrientation.field])).nice()
        .range([ 0, width ]);
}

const getYScale = () => {
    return d3.scaleLinear()
        .domain(d3.extent(store.data, d=>d[yOrientation.field])).nice()
        .range([ height, 0]);
}

const dropDomain = (g) => {
    g.select(".domain").remove();
}

explanations = d3.select('g#base').append('g').attr('id', 'explanations')

const addExplanation = (g, axis) => {
    clone = g.select(".tick:last-of-type text").clone()
    
    standalone = d3.select(`text#explanation-${axis}`)
    if (!standalone.node()) {
        standalone = explanations.append('text').attr("id", `explanation-${axis}`).attr('font-weight', 'bold').attr("font-size", 10).attr("font-family", "sans-serif");
    }

    if (axis === 'y') {
        standalone
            .attr("text-anchor", "start")
            .attr("x", 5)
            .attr("y", margin.top)
            .text(window.currentY);
    } else if (axis === 'x') {
        standalone
            .attr("transform", "translate(0,"+height+")")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", 30)
            .text(window.currentX);
    }
}

function make_x_gridlines(x) {		
    return d3.axisBottom(x)
        .ticks(5)
}

function make_y_gridlines(y) {		
    return d3.axisLeft(y)
        .ticks(5)
}

d3.json(DATA_DIR + 'node-overview.json').then(data => {
    store.data = data;
    store._data = [];
    store.categories = Object.keys(store.data);
    store.performers = []
    store.categories.forEach(category => {
        store.performers.push(...Object.keys(store.data[category]))
        store.performers = [...new Set(store.performers)]
    })
    store.performers.forEach(performer=>{
        d = {
            performer: performer
        }
        store.categories.forEach(category => {
            d[category] = store.data[category][performer]
        });
        store._data.push(d);
    })
    store.data = store._data;
}).then(()=>{
    draw();
})

const draw = (arg={xVal: 'node_degrees', yVal: 'most_direct_edges'}) => {
    xVal = arg.xVal,
        yVal = arg.yVal;
    console.log(xVal, yVal);
    
    xOrientation = {
        field: xVal
    };
    xOrientation['explanation'] = mapping[xOrientation.field].explanation
    window.currentX = mapping[xOrientation.field].human;

    yOrientation = {
        field: yVal
    };
    yOrientation['explanation'] = mapping[yOrientation.field].explanation;
    window.currentY = mapping[yOrientation.field].human;

    var x = getXScale();
    xAxis = d3.axisBottom(x);
    
    gX = g.select('g#gX');
    if (!gX.node()) {
        gX = g.append("g")
        .attr("id", "gX")
    }
    gX.attr("transform", "translate(0," + height + ")")
    
    gX
        .call(xAxis)
        .call(dropDomain)
        .call(addExplanation, "x");
    
    /*
    gridX = g.append("g")
        .attr("id", "xGrid")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines(x)
        .tickSize(-height)
        .tickFormat("")
        )
        */
        
    var y = getYScale();
    yAxis = d3.axisLeft(y);
    gY = d3.select("g#gY");
    if (!gY.node()) {
        gY = g.append("g")
            .attr("id", "gY");
    }

    gY
        .call(yAxis)
        .call(dropDomain)
        .call(addExplanation, "y");
    /*
    gridY = g.append("g")
        .attr("id", "yGrid")
        .attr("class", "grid")
        .call(make_y_gridlines(y)
            .tickSize(-width)
            .tickFormat("")
        )
    */
   
    g_dots = undefined;
    if (!d3.select("g#dots").node()) {
        g_dots = g.append('g')
            .attr("id", "dots")
    } else {
        g_dots = d3.select("g#dots")
    }

    dot_data = store.data.map((d)=>{ return {id: d['performer'], x:d[xVal], y:d[yVal]}})

    dot = g_dots
        .selectAll("circle")
        .data(dot_data, d=>d)
        .join(
            enter => enter.append('circle')
                        .attr("id", d => string_to_slug(d.id) )
                        .attr("cx", d => x(d.x) )
                        .attr("cy", d => y(d.y) ),
            update => update
                        .attr("cx", d => x(d.x) )
                        .attr("cy", d => y(d.y) ),
            exit => exit.transition().attr("opacity", 0).remove()
        )
    dot.attr("r", getDotSize()).style('mix-blend-mode', 'multiply').style("fill", "rgba(255, 103, 7, 0.8)");

    dot.on('mouseout', () => {
        d3.selectAll('circle').style('fill', "rgba(255, 103, 7, 0.8)").attr('r', getDotSize()).style('mix-blend-mode', 'multiply');
        d3.select('div#txt').classed('d-none', true)
    });
    dot.on('mouseenter', (evt, dot) => {
        d3.selectAll('circle').style('fill', d=>d.id === dot.id ? 'red' : 'green').attr('r', d=>d.id === dot.id ? getDotSize() * 5 : getDotSize()).style('mix-blend-mode', 'normal')
        html = `
            <div class="user-select-none p-2 bg-dark text-white row" style="max-width:450px;">
            <div class="col-12 text-center">${dot.id}</div>
            <div class="col-6">
                ${dot.y} ${window.currentY}<br />
                <small>${yOrientation.explanation}</small>
            </div>
            <div class="col-6">
                ${dot.x} ${window.currentX}<br />
                <small>${xOrientation.explanation}</small>
            </div>
        `;
        d3.select('div#txt').classed('d-none', false).html(html).style('top', evt.y + 10 + 'px').style('left', evt.x + 10 + 'px')
    })

};


const zoomed = (evt) => {
    d3.select('g#dots').attr('transform', evt.transform)
    gX.call(xAxis.scale(evt.transform.rescaleX(getXScale())));
    gY.call(yAxis.scale(evt.transform.rescaleY(getYScale())));
}

const zoom = d3.zoom()
    .scaleExtent([0.5, 32])
    .on("zoom", zoomed);

svg.call(zoom);