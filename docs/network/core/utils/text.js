"use strict";

const minify = (s) => {
    return s
        .replace(/\>[\r\n ]+\</g, "><")
        .replace(/(<.*?>)|\s+/g, (m, $1) => ($1 ? $1 : " "))
        .trim();
};

/**
 * getCurrentGraphInfo takes no arguments but generates the HTML for the viz information.
 * The return value is always the HTML itself.
 * @return {string} html - raw HTML
 */
const getCurrentGraphInfo = () => {
    store.networkCount = [
        ...new Set(
            store.nodes.map((node) => node.connected.network.network_id)
        ),
    ].length;
    graph.networkCount = [
        ...new Set(
            graph.nodes.map((node) => node.connected.network.network_id)
        ),
    ].length;

    let _return = {
        numNodes: {
            class: [],
            content: `<strong>${graph.nodes.length}</strong><span class="text-muted">/${store.nodes.length}</span>`,
        },
        numEdges: {
            class: [],
            content: `<strong>${graph.edges.length}</strong><span class="text-muted">/${store.edges.length}</span>`,
        },
        unconnectedNodes: {
            class: [],
            content: hasUnconnectedNodes() ? getUnconnectedNodes().length : 0,
        },
        currentZoom: { class: [], content: (graph.k * 100).toFixed(0) + "%" },
        colorNetworks: {
            class: [window.coloredNetworks ? "text-warning" : "text-dark"],
            content: `${graph.networkCount}/${store.networkCount}`,
        },
        commentedNodes: {
            class: [window.toggledCommentedElements ? "bg-warning" : "bg-dark"],
            content: "", //Show nodes with comments
        },
        numCommunities: { class: [], content: "" },
    };
    if (Object.keys(graph.clusters).length)
        _return["numCommunities"] = {
            content: Object.keys(graph.clusters).length,
        };
    // html += `<span id="numCommunities" class="small me-2" data-bs-toggle="popover"><i class="me-1 bi bi-heart-fill"></i>${Object.keys(graph.clusters).length}</span>`;

    return _return;
};

/**
 * displayOrID takes one argument, which is any object.
 * The return value is a string, which is in descending order, the `display` property from the object, the `id` property of the object, or an empty string.
 * @param {Object} - Any given object
 * @returns {string} - A string for display
 */
const displayOrID = (o) => {
    let returnValue = o.display != undefined ? o.display : o.id;
    returnValue = returnValue === undefined ? "" : returnValue;
    return returnValue;
};

/**
 * generateNodeInfoHTML takes one required argument, the d3 selector for a given node.
 * The return value is always the HTML with the selected information about the node.
 * @param {Object} node - d3 selector for a given node.
 * @return {string} html - raw HTML
 */
const generateNodeInfoHTML = (node) => {
    let html = `<li class="list-group-item"><strong>ID</strong> ${node.display}</li>`;

    // degrees
    html += `<li class="list-group-item"><strong class="mb-1">Degree</strong> ${node.degrees.degree}
                <p class="m-0 mb-1 small">In: ${node.degrees.indegree}</p>
                <p class="m-0 mb-1 small">Out: ${node.degrees.outdegree}</p>
                <p class="m-0 small">Current in network: ${node.currentDegree}</p>
            </li>`;

    // source range
    html += `<li class="list-group-item"><strong class="mb-1">Source range</strong>
                <p class="m-0 small">${d3.min(node.sourceRange)}-${d3.max(
        node.sourceRange
    )}</p>
            </li>`;

    // centrality measures (v.1)
    if (node["1000x-betweenness-centrality"]) {
        html += `<li class="list-group-item"><strong>Centrality measures (1000x)</strong><p class="m-0 mb-1 small text-muted">Note: Across entire network</p>
            <p class="m-0 mb-1 small">Betweenness: ${
                Math.round(node["1000x-betweenness-centrality"] * 100) / 100
            }</p>
            <p class="m-0 mb-1 small">Closeness: ${
                Math.round(node["1000x-closeness-centrality"] * 100) / 100
            }</p>
            <p class="m-0 mb-1 small">Degree: ${
                Math.round(node["1000x-degree-centrality"] * 100) / 100
            }</p>
            <p class="m-0 small">Eigenvector: ${
                Math.round(node["1000x-eigenvector-centrality"] * 100) / 100
            }</p>
        </li>`;
    }

    // centrality measures (v.2)
    if (node.centralities["betweenness_centrality_100x"]) {
        html += `<li class="list-group-item"><strong>Overall centrality measures (100x)</strong><p class="m-0 mb-1 small text-muted">Note: Across entire network</p>
                <p class="m-0 mb-1 small">Betweenness: ${node.centralities["betweenness_centrality_100x"]}</p>
                <p class="m-0 mb-1 small">Closeness: ${node.centralities["closeness_centrality_100x"]}</p>
                <p class="m-0 mb-1 small">Degree: ${node.centralities["degree_centrality_100x"]}</p>
                <p class="m-0 mb-1 small">Eigenvector: ${node.centralities["eigenvector_centrality_100x"]}</p>
            </li>`;
    }

    if (node.currentCentralities["betweenness_centrality_100x"]) {
        html += `<li class="list-group-item"><strong>Current centrality measures in network (100x)</strong><p class="m-0 mb-1 small text-muted">Note: In currently displayed network</p>
                <p class="m-0 mb-1 small">Betweenness: ${node.currentCentralities["betweenness_centrality_100x"]}</p>
                <p class="m-0 mb-1 small">Eigenvector: ${node.currentCentralities["eigenvector_centrality_100x"]}</p>
            </li>`;
    }

    // add comments...
    if (node.comments && node.comments.length > 0) {
        html += `<li class="list-group-item"><strong>${node.comments.length} Comments</strong>`;

        let unique_comments = [...new Set(node.comments.map((c) => c.content))];
        unique_comments.forEach((comment) => {
            let comments = node.comments.filter((c) => c.content === comment);
            html += `<p class="m-0 mb-1 small">${comment}`;
            comments.forEach((c, ix) => {
                if (ix === 0) html += `<div class="text-muted small"><small>(`;

                html += `${c.source}`;

                if (ix + 1 === comments.length) html += `)</small></div>`;
                else html += `; `;
            });
            html += `</p>`;
        });

        html += `</li>`;
    }
    return minify(html);
};

/**
 * generateEdgeInfoHTML takes one required argument, the d3 selector for a given edge.
 * The return value is always the HTML with the selected information about the edge.
 * @param {Object} edge - d3 selector for a given edge.
 * @return {string} html - raw minified HTML
 */
const generateEdgeInfoHTML = (edge) => {
    //, weightFromCurrent = undefined
    /*
    if (!weightFromCurrent)
        weightFromCurrent = settingsFromDashboard('generateEdgeInfoHTML').edges.weightFromCurrent;
    */

    let html = ''

    html += `<li class="list-group-item"><strong>ID</strong> ${edge.source.display} - ${edge.target.display}</li>`;

    html += '<li class="list-group-item">' + getQuickEdgeInfoHTML(edge, false, ['mb-1']) + '</li>';

    if (edge.venue) {
        html += `<li class="list-group-item"><strong>Venue</strong> ${edge.venue}</li>`;
    }

    if (edge.revue_name) {
        html += `<li class="list-group-item"><strong>Revue mentioned</strong> ${edge.revue_name}</li>`;
    }

    if (edge.revues) {
        html += `<li class="list-group-item"><strong>Revues</strong><ul>`;

        edge.revues.forEach(revue=>{
            html += `<li>${revue}</li>`;
        })
        
        html += `</ul></li>`;
    }

    html += `<li class="list-group-item">
        <p class="mb-1"><strong>Weights</strong></p>
        <p class="m-0 mb-1"><strong>In entire network:</strong> ${edge.weights.weight}</p>
        <p class="m-0 mb-1"><strong>Date groups:</strong> ${edge.weights.dateGroups}</p>
        <p class="m-0 mb-1"><strong>Number of dates:</strong> ${edge.weights.numDates}</p>
        <p class="m-0 mb-1"><strong>Number of locations:</strong> ${edge.weights.numLocations}</p>
        </li>
        `;

    if (edge.range.start) {
        html += `<li class="list-group-item"><strong>Range</strong> ${
            edge.range.start
        }${edge.range.end ? " – " + edge.range.end : ""}</li>`;
    }

    if (edge.has_general_comments) {
        html += `<li class="list-group-item"><strong class="mb-1">General comments</strong>`;
        edge.general_comments.forEach((obj) => {
            html += `<p class="m-0 mb-1 small">${obj.comment} <span class="text-muted">(${obj.source})</span></p>`;
        });
        html += `</li>`;
    }

    if (edge.has_comments) {
        html += `<li class="list-group-item"><strong class="mb-1">Comments on revue</strong>`;
        edge.comments.forEach((obj) => {
            html += `<p class="m-0 mb-1 small">${obj.comment} <span class="text-muted">(${obj.source})</span></p>`;
        });
        html += `</li>`;
    }

    /* // TODO: Sources are = date (fix in Python)
    if (edge.found) {
        html += `<li class="list-group-item"><strong class="mb-1">Found in sources:</strong>`;
        edge.found.forEach((source) => {
            html += `<p class="m-0 mb-1 small">${source}</p>`;
        });
        html += `</li>`;
    }
    */

    return minify(html);
};

/**
 * urlify takes one argument, a given text string, and searches for URLs in the text, and returns them back with HTML `<a>` elements inserted for each link.
 * The return value is the text with the replaced link.
 * @param {string} text - The text with potential unlinked links.
 * @returns {string} - Corrected text with `<a>` elements.
 */
const urlify = (text) => {
    // Source: https://www.labnol.org/code/20294-regex-extract-links-javascript
    return (text || "").replace(
        /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
        function (match, space, url) {
            var hyperlink = url;
            if (!hyperlink.match("^https?://")) {
                hyperlink = "http://" + hyperlink;
            }
            return (
                space +
                '<a target="_blank" href="' +
                hyperlink +
                '">' +
                url +
                "</a>"
            );
        }
    );
};

/**
 * generateCommentHTML takes one required argument, the d3 selector for a given node or edge, and generates the HTML for the popup information box. This is the function that handles the alt-button + "click" event on any given node or edge with comments in the graph.
 * The return value is a string of HTML.
 * @param {Object} elem - A d3 selector for any given node or edge.
 * @returns {string} - HTML with comments and information.
 */
const generateCommentHTML = (elem) => {
    let html = "";
    if (elem.node_id) {
        // we have a node!
        html += `<h1>${elem.display}</h1>`;
        if (elem.has_comments) {
            html += "<h2>Comments</h2>";
            elem.comments.forEach((c) => {
                html += `<p>${urlify(c.comment)} (${urlify(c.source)})</p>\n`;
            });
        }
    } else if (elem.edge_id) {
        // we have an edge!
        if (elem.revue_name) {
            html += `<h1>${elem.revue_name}</h1>`;
            html += `<h2>${elem.source.display} - ${elem.target.display}</h2>`;
        } else {
            html += `<h1>${elem.source.display} - ${elem.target.display}</h1>`;
        }

        if (elem.has_comments) {
            html += "<h2>Comments</h2>";
            elem.comments.forEach((c) => {
                html += `<p>${urlify(c.comment)} (${urlify(c.source)})</p>\n`;
            });
        }
        if (elem.has_general_comments) {
            html += "<h2>General comments</h2>";
            elem.general_comments.forEach((c) => {
                html += `<p>${urlify(c.comment)} (${urlify(c.source)})</p>\n`;
            });
        }
    }
    return html;
};

const getQuickEdgeInfoHTML = (edge, small=true, p_classes = [], ul_classes = [], li_classes = []) => {
    const splitDate = (location) => {
        let allYears = [];
        let allYearsWithMonths = [];
        let periods = edge.coLocated[location];
        periods.forEach((period) => {
            let years = [...new Set(period.map((date) => date.slice(0, 4)))];
            let yearsAndMonths = [
                ...new Set(period.map((date) => date.slice(0, 7))),
            ];
            allYears = [...allYears, ...years];
            allYearsWithMonths = [...allYearsWithMonths, ...yearsAndMonths];
        });
        return [allYears, allYearsWithMonths];
    };

    const getPeriodsAsText = (location) => {
        const getMonth = (num) => {
            let months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            return months[+num - 1];
        };
        let periods = edge.coLocated[location];
        let text = `<li class="${li_classes.join(' ')}${small ? ' small' : ''}">at <strong>${location}</strong> during ${
            periods.length === 1 ? "one" : periods.length
        } period${periods.length > 1 ? "s" : ""},`;
        periods.forEach((period, ix) => {
            let start = { full: period.sort()[0] };
            let end = { full: period.sort()[period.length - 1] };
            start.year = +start.full.slice(0, 4);
            start.month = +start.full.slice(5, 7);
            end.year = +end.full.slice(0, 4);
            end.month = +end.full.slice(5, 7);

            if (start.year === end.year && start.month === end.month) {
                text += ` in ${getMonth(start.month)} of ${start.year}`;
            } else if (start.year === end.year && start.month !== end.month) {
                text += ` ${getMonth(start.month)}–${getMonth(end.month)} of ${
                    start.year
                }`;
            } else if (start.year !== end.year && start.month !== end.month) {
                text += ` ${getMonth(start.month)} ${start.year}–${getMonth(
                    end.month
                )} ${end.year}`;
            }
            text += ` (${period.length} date${
                period.length > 1 ? "s" : ""
            } recorded)`;

            if (ix < periods.length) {
                text += "</li>";
            }
        });

        return text;
    };

    Object.keys(edge.coLocated).forEach((location) => {
        let allYears = splitDate(location);
        // console.log(allYears);
    });
    html = `<p class="${p_classes.join(' ')}${small ? ' small' : ''}"><strong>${edge.source.display}</strong> and <strong>${
        edge.target.display
    }</strong> appeared together at ${
        Object.keys(edge.coLocated).length > 1
            ? Object.keys(edge.coLocated).length
            : "one"
    } venue${Object.keys(edge.coLocated).length > 1 ? "s" : ""}:</p><ul class="${ul_classes.join(' ')}">`;

    let coLocatedCount = Object.keys(edge.coLocated).length - 1;

    Object.keys(edge.coLocated).forEach((location, ix) => {
        let numDates = edge.coLocated[location].length;
        html += getPeriodsAsText(location);
        if (ix < coLocatedCount) {
            // html += ' and ';
        }
    });
    html += `</ul>`;

    return html;
}

const quickEdgeInfo = (edge) => {
    let html = getQuickEdgeInfoHTML(edge);

    if (!isVisible("#nodeTable")) show("#quickEdgeInfo");
    document.querySelector("#quickEdgeInfo").innerHTML = html;
    document.querySelector("#quickEdgeInfo").style.left = "20px";
    document.querySelector("#quickEdgeInfo").style.top = `${window.innerHeight - document.querySelector("#quickEdgeInfo").offsetHeight - 20}px`
};

const quickCommentInfo = (comments, top = 0, left = 0) => {
    let html = ``;
    comments.forEach(comment => {
        html += `<ul><li><span class="text-dark">${comment.content}</span><br/>${comment.source}</li></ul>`;
    })
    html += ``;
    
    if (!isVisible("#nodeTable")) show("#quickEdgeInfo");
    document.querySelector("#quickEdgeInfo").innerHTML = html;
    document.querySelector("#quickEdgeInfo").style.top = `${top}px`
    document.querySelector("#quickEdgeInfo").style.left = `${left}px`
};
