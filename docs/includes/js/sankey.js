"use strict";

var datafile = DATA_DIR + "sankey-data.json";
var MINSIZE = 1300;

var opacities = {
    rectStandard: 0.1,
    strokeStandard: 0.2,
    strokeLight: 0.1,
    textStandard: 1,
};

// set the dimensions and margins of the graph
var margin = { top: 70, right: 20, bottom: 20, left: 20 }
const getVizContainer = () => {
    let style = getComputedStyle(d3.select('#viz-container').node());
    return {
        paddingLeft: +style.paddingLeft.replace('px', ''),
        paddingRight: +style.paddingRight.replace('px', ''),
        width: +style.width.replace('px', '')
    }
}
const width = () => {
    let vizContainer = getVizContainer();
    return vizContainer.width - vizContainer.paddingLeft - vizContainer.paddingRight;
}
const height = () => {
    return 800 + margin.top + margin.bottom;
}

var color = d3.scaleOrdinal(d3.schemeCategory10);

// append the svg object to the body of the page
var svg = d3
    .select("svg#sankey")
    .attr("width", width() + margin.left + margin.right)
    .attr("height", height()+ margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3
    .sankey()
    .nodeId((d) => d.name)
    .nodeWidth(5)
    .nodePadding(20)
    .size([width()- margin.left - margin.right, height()])
    .nodeAlign(d3.sankeyLeft);

var path = sankey.links();

var graph = {},
    link,
    node,
    rect,
    text,
    xScale = [],
    yScale = [];

const initialDataProcess = (data) => {
    const getPerformers = (link, paddedTravels = graph.paddedTravels) => {
        let performers =
            paddedTravels[link.source.state][link.target.state][link.startYear];
        return performers.filter((p) => p != "filler");
    };

    var nodeMap = {};
    data.nodes.forEach((node) => (nodeMap[node.id] = node));
    data.links = data.links.map((link) => {
        let d = {
            source: nodeMap[link.source],
            target: nodeMap[link.target],
            value: link.value,
            startState: link.startState,
            endState: link.endState,
            startYear: link.startYear,
            endYear: link.endYear,
            color: color(link.state),
            displayState: nodeMap[link.source].display
                .replace(/[0-9]/g, "")
                .trim(),
            performers: [],
            performerCount: 0,
        };
        d.performers = getPerformers(d, data.paddedTravels);
        d.performerCount = d.performers.length;
        return d;
    });
    data.nodes.forEach((node) => {
        node.displayState = node.display.replace(/[0-9]/g, "").trim();
    });
    return data;
};

const getSankeyGraph = (data) => {
    graph = sankey(data);
    graph.paddedTravels = data.paddedTravels;

    graph.nodes.forEach((node) => {
        node.performerCounts = {
            source: d3.sum(node.sourceLinks.map((cmp) => cmp.performerCount)),
            target: d3.sum(node.targetLinks.map((cmp) => cmp.performerCount)),
        };
        node.performerCounts.total = d3.sum([
            node.performerCounts.source,
            node.performerCounts.target,
        ]);
    });

    graph.states = [...new Set(graph.nodes.map((node) => node.state))];
    return graph;
};

const dimAllTexts = () => {
    d3.selectAll("text[data-state]").attr("opacity", 0.3);
};

const resetAllTexts = () => {
    d3.selectAll("text[data-state]").attr("opacity", opacities.textStandard);
};

const dimAllPaths = () => {
    d3.selectAll("path[data-startState]").attr(
        "stroke-opacity",
        opacities.strokeLight
    );
};

const resetAllPaths = () => {
    d3.selectAll("path[data-startState]").attr(
        "stroke-opacity",
        opacities.strokeStandard
    );
};

const getLastYear = (state) => {
    if (!state) return undefined;

    let nodes = graph.nodes
        .filter((node) => node.state === state)
        .filter((node) => node.performerCounts.total > 0);
    nodes = nodes.slice(nodes.length - 1);
    if (nodes[0]) {
        console.log(state, nodes[0].year);
        return nodes[0].year;
    } else {
        return undefined;
    }
};

const getStatePaths = (state, lastPath = false, target_state = undefined) => {
    const getWidth = (elem) =>
        +getComputedStyle(elem)["stroke-width"].replace("px", "");
    let elems = [];
    if (!target_state) {
        elems = [
            ...document.querySelectorAll(
                `path[data-startState="${state}"][data-endState="${state}"]`
            ),
        ];
    } else {
        if (target_state === "any") {
            console.log("target state is set to any");
            console.log(state, "is the only thing we will use");
            elems = [
                ...document.querySelectorAll(
                    `path[data-startState="${state}"]`
                ),
            ];
        } else {
            elems = [
                ...document.querySelectorAll(
                    `path[data-startState="${state}"][data-endState="${target_state}"]`
                ),
            ];
        }
    }
    let objects = elems.map((elem) => {
        let d = {
            path: elem,
            startYear: elem.dataset.startYear,
            endYear: elem.dataset.endYear,
            startState: elem.dataset.startState,
            endState: elem.dataset.endState,
            displayState: elem.dataset.displayState,
            performerCount: elem.dataset.performerCount,
            width: getWidth(elem),
            endPoint: elem.getPointAtLength(elem.getTotalLength()),
        };
        return d;
    });
    if (lastPath) {
        objects = objects.sort((a, b) => b.startYear - a.startYear);
        return objects[0];
    }
    return objects.sort((a, b) => a.startYear - b.startYear);
};

const getTravelsByYear = (state) => {
    //console.log("getTravelsByYear called", state);
    let data = d3.range(1930, 1940).map((year) => {
        let data = graph.links
            .filter(
                (link) =>
                    link.startState === state &&
                    link.startYear === year &&
                    link.performers.length > 0
            )
            .map((link) => {
                // console.log(link);
                return {
                    startYear: link.startYear,
                    endYear: link.endYear,
                    endState: link.endState,
                    performers: link.performers,
                    endDisplayState: link.target.displayState,
                };
            });
        data = {
            state: state,
            year: year,
            data: data,
        };
        return data;
    });
    return data;
};

const showTravels = (d) => {
    let travels = getTravelsByYear(d.startState);
    d3.range(1930, 1940).forEach((year) => {
        let elem = d3.select(`div#information-${year}`);
        let ix = travels.findIndex((d) => d.year === year);
        let html = "";
        let color = d3.color(d.color).darker(1);
        color.opacity = 0.1;
        let li_style = `background:${color}`;
        travels[ix].data.forEach((n) => {
            html += `<h4>${d.source.displayState} &#8594;</h4>`;
            html += `<h4><strong>${n.endDisplayState}</strong></h4><ul>`;
            html +=
                `<li style="${li_style}">` +
                n.performers.sort().join(`</li><li style="${li_style}">`) +
                "</li></ul>";
        });
        if (html) {
            html = `<h3 class="border-bottom">${year}</h3>` + html;
        }
        elem.html(html);
        elem.classed("d-none", false);
    });
};

const hideTravels = () => {
    d3.range(1930, 1940).forEach((year) => {
        let elem = d3.select(`div#information-${year}`);
        elem.classed("d-none", true);
    });
};

d3.json(datafile)
    .then((data) => {
        data = initialDataProcess(data);
        console.info("Data loaded, timestamp:", data.saved);

        graph = getSankeyGraph(data);
    })
    .then(() => {
        // setup links
        let link_g = svg
            .append("g")
            .attr("id", "paths")
        
        link = link_g
            .selectAll("path.link")
            .data(graph.links)
            .join("path")
            .attr("class", "link")
            .attr("stroke-width", (d) => d.width)
            .attr("stroke", (d) => (d.performers.length ? d.color : 0))
            .attr("data-startState", (d) => d.startState)
            .attr("data-endState", (d) => d.endState)
            .attr("data-displayState", (d) => d.displayState)
            .attr("data-startYear", (d) => d.startYear)
            .attr("data-endYear", (d) => d.endYear)
            .attr("data-performerCount", (d) => d.performerCount);
        
        link
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("y0", (d) => d.y0)
            .attr("y1", (d) => d.y1);

        link.attr("stroke-opacity", opacities.strokeStandard);
        
        // setup link interactivity
        link.on("click", (event, d) => {
            if (!window.locked) {
                window.locked = d.startState;
                d3.select("body").classed("locked", true);
            } else {
                d3.select("body").classed("locked", false);
                delete window.locked;
            }
            // console.log(window.locked);
        });

        link.on("mouseenter", (event, d) => {
            if (!window.locked) {
                dimAllTexts();
                dimAllPaths();

                let relatedTexts = d3.selectAll(
                    `text[data-state="${d.state}"]`
                );
                relatedTexts.attr("opacity", 1);

                let relatedPaths = d3.selectAll(
                    `path[data-startState="${d.startState}"]`
                );
                relatedPaths.attr("stroke-opacity", 0.7);

                relatedPaths = getStatePaths(d.source.state);
                let lastAvailableYear = getStatePaths(d.source.state, true);
                // console.log(relatedPaths);
                // console.log(lastAvailableYear);
                let pointer = d3
                    .select("div#pointer")
                    .html(d.displayState)
                    .style(
                        "top",
                        `${lastAvailableYear.endPoint.y + margin.top / 2}px`
                    )
                    .classed("d-none", false);

                if (lastAvailableYear.endYear != 1940) {
                    pointer.style("left", "200px");
                } else {
                    pointer.style("left", `${width() + margin.left}px`);
                }

                showTravels(d);
            }
        });

        link.on("mouseout", () => {
            if (!window.locked) {
                hideTravels();
                d3.select("div#pointer").classed("d-none", true);
                resetAllTexts();
                d3.selectAll("path[data-startState]").attr(
                    "stroke-opacity",
                    opacities.strokeStandard
                );
            } else {
                console.info("Not removing content due to window lock.");
            }
        });

        // add in the nodes
        let node_g = svg
            .append("g")
            .attr("id", "nodes")
            
        node = node_g
            .selectAll(".node")
            .data(graph.nodes)
            .join("g")
            .attr("class", "node")
            .attr("data-id", (d) => d.id)
            .attr("data-performerCount", (d) => d.performerCounts.total);

        // add the rectangles for the nodes
        rect = node
            .append("rect")
            .attr("x", (d) => d.x0)
            .attr("y", (d) => d.y0)
            .attr("opacity", (d) =>
                d.connectedPerformers ? opacities.rectStandard : 0
            )
            .attr("height", (d) => d.y1 - d.y0)
            .attr("width", sankey.nodeWidth())
            .attr("data-id", (d) => d.id)
            .attr("data-year", (d) => d.year)
            .attr("data-state", (d) => d.state)
            .attr("data-displayState", (d) => d.displayState)
            .attr("data-display", (d) => d.display)
            .style("fill", (d) => (d.color = color(d.state)));

        // add in the title for the nodes
        text = node
            .append("text")
            .attr("x", (d) => d.x0 - 6)
            .attr("y", (d) => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("opacity", 1)
            .attr("text-anchor", "end")
            .attr("data-performerCount", (d) => d.performerCounts.total)
            .attr("data-state", (d) => d.state)
            .text((d) => d.displayState)
            .filter((d) => d.x0 < width() / 2)
            .attr("x", (d) => d.x1 + 6)
            .attr("text-anchor", "start");
    })
    .then(() => {
        // drop all paths with no performer counts
        d3.selectAll(`path[data-performerCount="0"]`).remove();

        // setup xScale
        document
            .querySelectorAll('.node[data-id*="new-york"] rect')
            .forEach((elem) => {
                let is1940 = elem.dataset.year === "1940";
                let data = is1940
                    ? undefined
                    : { x: elem.x.baseVal.value, year: elem.dataset.year };
                if (data) xScale.push(data);
            });

        let xScaleElement = svg
            .append("g")
            .attr("id", "xScale")
            .selectAll("text")
            .data(xScale)
            .join("text")
            .text((d, i) => 1930 + i)
            .attr("x", (d) => d.x + 10)
            .attr("y", 0)
            .attr("dy", "-0.5em")
            .attr("font-weight", "700")
            .attr("opacity", 0.2)
            .attr("text-anchor", "start");

        // setup yScale
        document
            .querySelectorAll('.node[data-id*="1930"] rect')
            .forEach((elem) => {
                yScale.push({ y: elem.y.baseVal.value, state: elem.state });
            });

        yScale.sort((a, b) => a.y - b.y);

        let yScaleElement = svg
            .append("g")
            .attr("id", "yScale")
            .selectAll("text")
            .data(yScale)
            .join("text")
            .text((d) => d.state)
            .attr("x", -20)
            .attr("y", (d, i) => d.y)
            .attr("dy", "0.35em")
            .attr("text-anchor", "end");

        // setup infoCountainer
        let infoContainer = setupInfoContainer()
        
        let infoElements = infoContainer
            .selectAll("div.informationBox")
            .data(xScale)
            .join("div")
            .attr("class", "informationBox")
            .attr("id", (d) => "information-" + d.year)
            .style("left", (d) => margin.left + d.x + "px")
            .style("top", '0px')
            .style("width", `${width() / 10 - 5}px`)
            .style("max-width", `${width() / 10 - 5}px`)
            .attr("font-weight", "700")
            .attr("opacity", 0.2)
            .attr("text-anchor", "start");

        window.addEventListener('resize', resizeWindow)

        console.log(window.innerWidth, MINSIZE)
        if (window.innerWidth >= MINSIZE) {
            d3.select('#screenSizeWarning').classed('d-none', false);
            d3.select('#screenSizeWarningInfo').classed('d-none', true).classed('d-flex', false);
        } else {
            d3.select('#screenSizeWarning').classed('d-none', true);
            d3.select('#screenSizeWarningInfo').classed('d-none', false).classed('d-flex', true);
        }
    });

const resizeWindow = () => {
    console.log('resize called')
    window.location.reload();
}

const setupInfoContainer = () => {
    let style = getComputedStyle(document.querySelector('#viz-container'))
    let w = style.width.replace('px', '');
    let pl = style.paddingLeft.replace('px', '');
    let pr = style.paddingRight.replace('px', '');
    console.log(w, pl, pr)
    let infoContainer = d3.select('div#information')
            .style('top', `${height() + margin.top}px`)
            .style('width', `${w}px`)
            .style('padding-left', `${pl}px`)
            .style('padding-right', `${pr}px`)
            .style('height', `${window.innerHeight - (height() + margin.top + margin.bottom)}px`)
        return infoContainer;
}