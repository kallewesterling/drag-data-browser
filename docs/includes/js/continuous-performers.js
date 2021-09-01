"use strict";

let store = {
    data: {},
    dataDetail: {},
    rawData: {},
    oneMonth: 0,
    scales: {},
    allPerformers: []
};

let STANDARD_CIRCLE = 1.5;
let TOLERANCES = [0, 1, 2, 3, 4, 5];

// parse the date / time
var dateParser = d3.timeParse("%Y-%m-%d");
let popup = d3.select('div#popup')
let display_num = popup.select('div#displayNum')

// setup standard sizes for the svgs
const margin = () => {
    return {top: 20, right: 20, bottom: 40, left: 40}
}
const width = () => {
    let vizContainer = getComputedStyle(document.querySelector('#viz-container'));
    let vizContainerWidth = vizContainer.width.replace('px','');
    let paddingLeft = vizContainer.paddingLeft.replace('px','');
    let paddingRight = vizContainer.paddingRight.replace('px','');
    let returnVal = vizContainerWidth - paddingLeft - paddingRight - margin().left - margin().right;
    return returnVal;
}
const height = () => {
    return 300 - margin().top - margin().bottom;
}

const getScale = (xOrY, tolerance) => {
    let localData = store.data['tolerance' + tolerance];
    if (xOrY === 'x') {
        return d3.scaleTime().range([0, width()]).domain(d3.extent(localData, d=>d.date));
    } else if (xOrY === 'y') {
        return d3.scaleLinear().range([height(), 0]).domain([0, d3.max(localData, d=>d.num_artists)]);
    } else {
        log.error('NOPE')
    }
}

const searchPerformer = (name) => {
    let found = {};
    TOLERANCES.forEach(tolerance => {
        let years = Object.keys(store.dataDetail[`tolerance${tolerance}`]);
        years.forEach(year=>{
            let months = Object.keys(store.dataDetail[`tolerance${tolerance}`][year]);
            months.forEach(month=>{
                let performers = store.dataDetail[`tolerance${tolerance}`][year][month];
                if (performers.includes(name)) {
                    if (!Object.keys(found).includes(`tolerance${tolerance}`)) {
                        found[`tolerance${tolerance}`] = []
                    }
                    if (!found[`tolerance${tolerance}`].includes(`${year},${month}`)) {
                        found[`tolerance${tolerance}`].push(`${year},${month}`)
                    }
                }
            });
        });
    });
    return found
}

const searchPerformerAcrossAll = (name) => {
    let found = searchPerformer(name);
    TOLERANCES.forEach(tolerance=>{
        // console.log();
        markFound(found[`tolerance${tolerance}`], tolerance);
    });
}

const getDetailData = (tolerance, year, month) => {
    return store['dataDetail'][`tolerance${tolerance}`][year][month].sort();
}

const mouseClick = (loc, event, snap=true, tolerance) => {
    let data = store.data['tolerance' + tolerance];
    let [xLoc, yLoc] = loc;
    let xScale = getScale('x', tolerance);
    let datePoint = xScale.invert(xLoc);
    let dataPoint = reverseData(data, datePoint);
    let performers = getDetailData(tolerance, dataPoint.year, dataPoint.month);
    d3.selectAll(`.performer-lists`).classed('d-none', true);
    let html = "";
    performers.forEach(performer => {
        html += `<span class="d-inline-block p-1 rounded-3 bg-dark m-1"><a class="text-white text-decoration-none" href="?name=${performer}">${performer}</a></span>`;
    })
    d3.select(`#performers-${tolerance}`).html(html);
    d3.select(`#performers-${tolerance}`).classed('d-none', false);
}

const reverseData = (localData, datePoint) => {
    var bisect = d3.bisector(function(d) { return d.date; }).right;
    let ix = bisect(localData, datePoint);
    return localData[ix];
}

const getLegend = (tolerance) => {
    switch (tolerance) {
        case 0:
            return 'Number of performers performing within a given month'
        case 1:
            return 'Number of performers normalized from the surrounding 3-month period (± 1mo)'
        case 2:
            return 'Number of performers normalized from the surrounding 5-month period (± 2mo)'
        case 3:
            return 'Number of performers normalized from the surrounding 7-month period (± 3mo)'
        case 4:
            return 'Number of performers normalized from the surrounding 9-month period (± 4mo)'
        case 5:
            return 'Number of performers normalized from the surrounding 11-month period (± 5mo)'
    }
    return 'undefined'
}

const makeLegend = (tolerance) => {

    let svg = d3.select(`svg#tolerance${tolerance}`);

    svg = svg.select(`g#tolerance-${tolerance}`);

    if (svg.select('g.legend').node()) {
        // console.log('legend already exists')
        return true;
    }

    var legend = svg
        .append('g')
        .attr('class', 'legend');
    
    legend.append('circle')
        .attr('cx', 30 + 5)
        .attr('cy', 30)
        .attr('r', 5)
        .classed('foundPerformer', true)
        .classed('hidden', true)
        .style('fill', 'red');

    legend.append('rect')
        .attr('x', 30)
        .attr('y', (d, i) => i * 20)
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', 'steelblue');

    legend.append('text')
        .attr('x', 45)
        .attr('y', function(d, i) {
            return 30 + 5;
        })
        .text(() => 'Month when performer appears in dataset')
        .classed('foundPerformer', true)
        .classed('hidden', true)
        .classed('legendText', true);

    legend.append('text')
        .attr('x', 45)
        .attr('y', function(d, i) {
            return (i * 20) + 9;
        })
        .text(() => getLegend(tolerance))
        .attr('class', 'legendText');
};

const makeAxes = (tolerance) => {
    let svg = d3.select(`svg#tolerance${tolerance} g#tolerance-${tolerance}`);

    let xScale = getScale('x', tolerance);
    let yScale = getScale('y', tolerance);

    if (!svg.select(`g.xScale-${tolerance}`).node()) {
        svg.append("g")
            .attr("class", `xScale-${tolerance}`)
            .attr("transform", "translate(0," + height() + ")")
            .call(d3.axisBottom(xScale));
    } else {
        svg.select(`g.xScale-${tolerance}`)
            .attr("transform", "translate(0," + height() + ")")
            .call(d3.axisBottom(xScale));
    }

    // add y Axis
    if (!svg.select(`g.yScale-${tolerance}`).node()) {
        svg.append("g")
            .attr("class", `yScale-${tolerance}`)
            .call(d3.axisLeft(yScale));
    } else {
        svg.select(`g.yScale-${tolerance}`)
            .call(d3.axisLeft(yScale));
    }
}

const makeMouseLine = (tolerance) => {
    let svg = d3.select(`svg#tolerance${tolerance} g#tolerance-${tolerance}`);

    if (svg.select(`g.mouse-over-effects-${tolerance}`).node()) {
        return true;
    }

    svg.append("g")
        .attr("class", `mouse-over-effects-${tolerance}`);
    
    d3.select(`g.mouse-over-effects-${tolerance}`)
        .append("path") // this is the black vertical line to follow mouse
        .attr("class", `mouse-line-${tolerance}`)
        .style("stroke-width", `${store.oneMonth}px`) // * months
        .style("opacity", "0");

    d3.select(`g.mouse-over-effects-${tolerance}`)
        .append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', width()) // can't catch mouse events on a g element
        .attr('height', height())
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
}

const renderContinousPerformanceData = (tolerance=0) => {
    let svg = '';
    if (d3.select(`svg#tolerance${tolerance} g#tolerance-${tolerance}`).node()) {
        // console.log('found existing svg with tolerance', tolerance)
        svg = d3.select(`svg#tolerance${tolerance}`)
            .attr("width", width() + margin().left + margin().right)
            .attr("height", height() + margin().top + margin().bottom);
        svg = svg.select(`g#tolerance-${tolerance}`);
    } else {
        svg = d3.select(`svg#tolerance${tolerance}`)
            .attr("width", width() + margin().left + margin().right)
            .attr("height", height() + margin().top + margin().bottom)
            .append("g")
            .attr("id", `tolerance-${tolerance}`)
            .attr("transform", "translate(" + margin().left + "," + margin().top + ")");
    }

    let data = store.data[`tolerance${tolerance}`];
    
    // set the ranges
    let xScale = getScale('x', tolerance);
    let yScale = getScale('y', tolerance);

    store.oneMonth = xScale(dateParser('1930-02-01')) - xScale(dateParser('1930-01-01'))

    // define the line
    let valueline = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.num_artists));

    // draw our two main lines
    let pathGroup = svg
        .selectAll("g.paths")
        .data([data])
        .join(enter=>enter.append('g')
        .attr('class', 'paths'))

    let line = pathGroup
        .selectAll("path.line")
        .data([data])
        .join(
            enter => enter.append('path')
                .attr("d", valueline),
            update => update
                .attr("d", valueline)
        )
    
    line
        .attr("class", "line");
    
    let shadowLine = pathGroup
        .selectAll("path.shadowLine")
        .data([data])
        .join(
            enter => enter
                .append('path')
                .attr("d", valueline),
            update => update
                .attr("d", valueline)
        )
    
    shadowLine
        .attr("class", "shadowLine")
        .attr('transform', 'translate(2 2)');
    
    // add circles
    let circleGroup = svg
        .selectAll("g.circles")
        .data([data])
        .join(
            enter=>enter
                .append('g')
                .attr('class', 'circles')
        )
    
    let circle = circleGroup
        .selectAll("circle")
        .data(data)
        .join(
            enter => enter
                .append("circle"),
            update => update
        );
    
    circle
        .attr('class', 'node')
        .attr("r", STANDARD_CIRCLE)
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.num_artists))
        .attr('id', d=>`${d.month}-${d.year}`)

    // make both axes
    makeAxes(tolerance);

    // make legend
    makeLegend(tolerance);

    makeMouseLine(tolerance);
};


const getMonthRange = (month, year, range) => {
    switch (month) {
        case 'Jan':
            switch (range) {
                case 0:
                    return `<strong>Jan 1–31, ${year}</strong>`
                case 1:
                    return `<strong>Jan</strong><br/>normalized over<br/>Dec ${year-1}–Feb ${year}`
                case 2:
                    return `<strong>Jan</strong><br/>normalized over<br/>Nov ${year-1}–Mar ${year}`
                case 3:
                    return `<strong>Jan</strong><br/>normalized over<br/>Oct ${year-1}–Apr ${year}`
                case 4:
                    return `<strong>Jan</strong><br/>normalized over<br/>Sep ${year-1}–May ${year}`
                case 5:
                    return `<strong>Jan</strong><br/>normalized over<br/>Aug ${year-1}–Jun ${year}`
            }
        case 'Feb':
            switch (range) {
                case 0:
                    return `<strong>Feb 1–28, ${year}</strong>`
                case 1:
                    return `<strong>Feb</strong><br/>normalized over<br/>Jan–Mar ${year}`
                case 2:
                    return `<strong>Feb</strong><br/>normalized over<br/>Dec ${year-1}–Apr ${year}`
                case 3:
                    return `<strong>Feb</strong><br/>normalized over<br/>Nov ${year-1}–May ${year}`
                case 4:
                    return `<strong>Feb</strong><br/>normalized over<br/>Oct ${year-1}–Jun ${year}`
                case 5:
                    return `<strong>Feb</strong><br/>normalized over<br/>Sep ${year-1}–Jul ${year}`
            }
        case 'Mar':
            switch (range) {
                case 0:
                    return `<strong>Mar 1–31, ${year}</strong>`
                case 1:
                    return `<strong>Mar</strong><br/>normalized over<br/>Feb–Apr ${year}`
                case 2:
                    return `<strong>Mar</strong><br/>normalized over<br/>Jan–May ${year}`
                case 3:
                    return `<strong>Mar</strong><br/>normalized over<br/>Dec ${year-1}–Jun ${year}`
                case 4:
                    return `<strong>Mar</strong><br/>normalized over<br/>Nov ${year-1}–Jul ${year}`
                case 5:
                    return `<strong>Mar</strong><br/>normalized over<br/>Oct ${year-1}–Aug ${year}`
            }
        case 'Apr':
            switch (range) {
                case 0:
                    return `<strong>Apr 1–30, ${year}</strong>`
                case 1:
                    return `<strong>Apr</strong><br/>normalized over<br/>Mar–May ${year}`
                case 2:
                    return `<strong>Apr</strong><br/>normalized over<br/>Feb–Jun ${year}`
                case 3:
                    return `<strong>Apr</strong><br/>normalized over<br/>Jan–Jul ${year}`
                case 4:
                    return `<strong>Apr</strong><br/>normalized over<br/>Dec ${year-1}–Aug ${year}`
                case 5:
                    return `<strong>Apr</strong><br/>normalized over<br/>Nov ${year-1}–Sep ${year}`
            }
        case 'May':
            switch (range) {
                case 0:
                    return `<strong>May 1–31, ${year}</strong>`
                case 1:
                    return `<strong>May</strong><br/>normalized over<br/>Apr–Jun ${year}`
                case 2:
                    return `<strong>May</strong><br/>normalized over<br/>Mar–Jul ${year}`
                case 3:
                    return `<strong>May</strong><br/>normalized over<br/>Feb–Aug ${year}`
                case 4:
                    return `<strong>May</strong><br/>normalized over<br/>Jan–Sep ${year}`
                case 5:
                    return `<strong>May</strong><br/>normalized over<br/>Dec ${year-1}–Oct ${year}`
            }
        case 'Jun':
            switch (range) {
                case 0:
                    return `<strong>Jun 1–30, ${year}</strong>`
                case 1:
                    return `<strong>Jun</strong><br/>normalized over<br/>May–Jul ${year}`
                case 2:
                    return `<strong>Jun</strong><br/>normalized over<br/>Apr–Aug ${year}`
                case 3:
                    return `<strong>Jun</strong><br/>normalized over<br/>Mar–Sep ${year}`
                case 4:
                    return `<strong>Jun</strong><br/>normalized over<br/>Feb–Oct ${year}`
                case 5:
                    return `<strong>Jun</strong><br/>normalized over<br/>Jan–Nov ${year}`
            }
        case 'Jul':
            switch (range) {
                case 0:
                    return `<strong>Jul 1–31, ${year}</strong>`
                case 1:
                    return `<strong>Jul</strong><br/>normalized over<br/>Jun–Aug ${year}`
                case 2:
                    return `<strong>Jul</strong><br/>normalized over<br/>May–Sep ${year}`
                case 3:
                    return `<strong>Jul</strong><br/>normalized over<br/>Apr–Oct ${year}`
                case 4:
                    return `<strong>Jul</strong><br/>normalized over<br/>Mar–Nov ${year}`
                case 5:
                    return `<strong>Jul</strong><br/>normalized over<br/>Feb–Dec ${year}`
            }
        case 'Aug':
            switch (range) {
                case 0:
                    return `<strong>Aug 1–31, ${year}</strong>`
                case 1:
                    return `<strong>Aug</strong><br/>normalized over<br/>Jul–Sep ${year}`
                case 2:
                    return `<strong>Aug</strong><br/>normalized over<br/>Jun–Oct ${year}`
                case 3:
                    return `<strong>Aug</strong><br/>normalized over<br/>May–Nov ${year}`
                case 4:
                    return `<strong>Aug</strong><br/>normalized over<br/>Apr–Dec ${year}`
                case 5:
                    return `<strong>Aug</strong><br/>normalized over<br/>Mar ${year}–Jan ${year+1}`
            }
        case 'Sep':
            switch (range) {
                case 0:
                    return `<strong>Sep 1–30, ${year}</strong>`
                case 1:
                    return `<strong>Sep</strong><br/>normalized over<br/>Aug–Oct ${year}`
                case 2:
                    return `<strong>Sep</strong><br/>normalized over<br/>Jul–Nov ${year}`
                case 3:
                    return `<strong>Sep</strong><br/>normalized over<br/>Jun–Dec ${year}`
                case 4:
                    return `<strong>Sep</strong><br/>normalized over<br/>May ${year}–Jan ${year+1}`
                case 5:
                    return `<strong>Sep</strong><br/>normalized over<br/>Apr ${year}–Feb ${year+1}`
            }
        case 'Oct':
            switch (range) {
                case 0:
                    return `<strong>Oct 1–31, ${year}</strong>`
                case 1:
                    return `<strong>Oct</strong><br/>normalized over<br/>Sep–Nov ${year}`
                case 2:
                    return `<strong>Oct</strong><br/>normalized over<br/>Aug–Dec ${year}`
                case 3:
                    return `<strong>Oct</strong><br/>normalized over<br/>Jul ${year}–Jan ${year+1}`
                case 4:
                    return `<strong>Oct</strong><br/>normalized over<br/>Jun ${year}–Feb ${year+1}`
                case 5:
                    return `<strong>Oct</strong><br/>normalized over<br/>May ${year}–Mar ${year+1}`
            }
        case 'Nov':
            switch (range) {
                case 0:
                    return `<strong>Nov 1–30, ${year}</strong>`
                case 1:
                    return `<strong>Nov</strong><br/>normalized over<br/>Oct–Dec ${year}`
                case 2:
                    return `<strong>Nov</strong><br/>normalized over<br/>Sep ${year}–Jan ${year+1}`
                case 3:
                    return `<strong>Nov</strong><br/>normalized over<br/>Aug ${year}–Feb ${year+1}`
                case 4:
                    return `<strong>Nov</strong><br/>normalized over<br/>Jul ${year}–Mar ${year+1}`
                case 5:
                    return `<strong>Nov</strong><br/>normalized over<br/>Jun ${year}–Apr ${year+1}`
            }
        case 'Dec':
            switch (range) {
                case 0:
                    return `<strong>Dec 1–31, ${year}</strong>`
                case 1:
                    return `<strong>Dec</strong><br/>normalized over<br/>Nov ${year}–Jan ${year+1}`
                case 2:
                    return `<strong>Dec</strong><br/>normalized over<br/>Oct ${year}–Feb ${year+1}`
                case 3:
                    return `<strong>Dec</strong><br/>normalized over<br/>Sep ${year}–Mar ${year+1}`
                case 4:
                    return `<strong>Dec</strong><br/>normalized over<br/>Aug ${year}–Apr ${year+1}`
                case 5:
                    return `<strong>Dec</strong><br/>normalized over<br/>Jul ${year}–May ${year+1}`
            }
    }
}

const getText = (dataPoint, tolerance) => {
    return `${getMonthRange(dataPoint.month, dataPoint.year, tolerance)}:<br/>${dataPoint.num_artists}`;
}

const mouseEvent = (onOff, tolerance) => {
    if (onOff) {
        d3.select(`.mouse-line-${tolerance}`)
            .style("opacity", "1");
        popup.classed('d-none', false);
    } else {
        d3.select(`.mouse-line-${tolerance}`)
            .style("opacity", "0");
        popup.classed('d-none', true);
    }
}

const mouseMove = (loc, event, snap=false, tolerance) => {
    let data = store.data[`tolerance${tolerance}`];
    let [xLoc, yLoc] = loc;
    let xScale = getScale('x', tolerance);
    let datePoint = xScale.invert(xLoc);
    let dataPoint = reverseData(data, datePoint);

    let xLocSnap = xScale(dataPoint.date);
    if (snap) {
        d3.select(`.mouse-line-${tolerance}`).attr("d", `M${xLocSnap},${height()+margin().top} ${xLocSnap},${-margin().top}`); // set correct X on mouseline
    } else {
        d3.select(`.mouse-line-${tolerance}`).attr("d", `M${xLoc},${height()+margin().top} ${xLoc},${-margin().top}`); // set correct X on mouseline
    }

    if (dataPoint.num_artists) {
        display_num.html(getText(dataPoint, tolerance));
        popup.classed('d-none', false);

        let xOffset = getComputedStyle(d3.select('#popup').node()).width.replace('px', '')/2;
        yLoc = d3.select(`svg#tolerance${tolerance} g.xScale-${tolerance}`).node().getBoundingClientRect().top
        
        popup.attr('style', `left: ${event.clientX-xOffset}px; top: ${yLoc}px`);
    }
}

const setupInteractivity = (tolerance) => {
    d3.select(`g .mouse-over-effects-${tolerance} rect`)
        .on('mouseout', () => mouseEvent(false, tolerance))
        .on('mouseover', () => mouseEvent(true, tolerance))
        .on('mousemove', (evt) => mouseMove(d3.pointer(evt), evt, true, tolerance))
        .on('click', (evt) => mouseClick(d3.pointer(evt), evt, true, tolerance));
}

const addDataToTables = (tolerance) => {
    let data = store.data[`tolerance${tolerance}`];
    data = data.filter(d=>d.year >= 1930 && d.year <= 1940);
    function tabulate(data, columns) {
        var table = d3.select(`table#tolerance${tolerance}`);
        var thead = table.select('thead');
        var tbody = table.select('tbody');
		
		// append the header row
		thead.append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')
            .text(function (column) { return column; });

		// create a row for each object in the data
		var rows = tbody.selectAll('tr')
            .data(data)
            .enter()
            .append('tr');

		// create a cell in each row for each column
		var cells = rows.selectAll('td')
            .data(function (row) {
                return columns.map(function (column) {
                    return {column: column, value: row[column]};
                });
                })
            .enter()
            .append('td')
            .attr('class', 'p-2')
            .text(function (d) { return d.value; });

        return table;
	}

	// render the table(s)
	tabulate(data, ['year', 'month', 'num_artists']); // 2 column table

}

const markFound = (found, tolerances, clear_first=true) => {
    if (typeof tolerances === 'number') {
        tolerances = [tolerances];
    }
    if (clear_first) {
        tolerances.forEach(tolerance=>{
            d3.selectAll(`svg#tolerance${tolerance} g.circles circle`).classed('selected', false).attr('r', STANDARD_CIRCLE);
            d3.selectAll(`svg#tolerance${tolerance} .foundPerformer`).classed('hidden', true);
        });
    }
    tolerances.forEach(tolerance=>{
        found.forEach(f=>{
            let [year, month] = f.split(',');
            d3.select(`svg#tolerance${tolerance} g.circles circle#${month}-${year}`).classed('selected', true).transition().duration(1000).attr('r', 5);
        })
        d3.selectAll(`svg#tolerance${tolerance} .foundPerformer`).classed('hidden', false);
    })
}

const addOptions = (tolerance) => {
    let dropDown = d3.select(`#tolerance${tolerance}-filter`)
    let filterAll = d3.select(`#tolerance${tolerance}-filter-all`)

    let options = dropDown.selectAll('option')
        .data(['', ...sortPerformersByCount(tolerance, true)])
        .join(
            enter => enter 
                        .append('option'),
            update => update,
            exit => exit.remove()
        )

    options.text(d => d)
        .attr("value", d=>d)
        .html(d=>{
            if (d)
                return `${d} (${countPerformer(d, tolerance)})`;
        });

    dropDown.on("change", (evt) => {
        let performerName = dropDown.node().value;
        if(performerName === '') {
            filterAll.classed('d-none', true);
            d3.selectAll(`svg#tolerance${tolerance} g.circles circle`).classed('selected', false).attr('r', STANDARD_CIRCLE);
        } else {
            let found = searchPerformer(performerName)[`tolerance${tolerance}`];
            markFound(found, tolerance);
            filterAll.classed('d-none', false);
            d3.select(`#tolerance${tolerance}-filter-all a`).attr('href', window.location.pathname + '?name=' + performerName);
        }
    })
}

let loader = [];
TOLERANCES.forEach(tolerance=>{
    loader.push(d3.json(DATA_DIR + `continuous-performances-tolerance-${tolerance}.json`))
});

let detail_loader = [];
TOLERANCES.forEach(tolerance=>{
    detail_loader.push(d3.json(DATA_DIR + `continuous-performances-tolerance-${tolerance}-detail.json`))
});

Promise.all(loader).then(function(files) {
    console.log('files loaded:', loader);
    TOLERANCES.forEach(tolerance => {
        files[tolerance].forEach(d=>{if (typeof d.date === 'string') { d.date = dateParser(d.date) } }); // fix dates
        store.data[`tolerance${tolerance}`] = files[tolerance].filter(d=>d.date.getFullYear() >= 1930 && d.date.getFullYear() < 1940)
    })
}).then(() => {
    Promise.all(detail_loader).then(function(files) {
        console.log('files loaded:', detail_loader);
        TOLERANCES.forEach(tolerance => {
            store.dataDetail[`tolerance${tolerance}`] = files[tolerance];
        });
    }).catch(function(err) {
        console.error(err)
    }).then(()=>{
        Object.keys(store.data).forEach(key=>{
            let tolerance = +key.replace('tolerance', '')
            renderContinousPerformanceData(tolerance);
            setupInteractivity(tolerance);
            addDataToTables(tolerance);
    
            let data = store.dataDetail[`tolerance${tolerance}`];
            Object.keys(data).forEach(year=>{
                Object.keys(data[year]).forEach(month=>{
                    data[year][month].forEach(performer=>{
                        if (!store.allPerformers.includes(performer))
                            store.allPerformers.push(performer)
                    });
                });
            });
            store.allPerformers.sort();
    
            addOptions(tolerance);
        });
    }).then(() => {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        if (params.name) {
            searchPerformerAcrossAll(params.name);
            TOLERANCES.forEach(tolerance => {
                d3.select(`#tolerance${tolerance}-filter`).node().value = params.name;
            });
        }
    });
});

window.addEventListener("resize", (evt)=>{
    TOLERANCES.forEach(tolerance => {
        renderContinousPerformanceData(tolerance);
    });
});

const countPerformer = (name, tolerance=1) => {
    let results = 0;
    Object.keys(store.dataDetail[`tolerance${tolerance}`]).forEach(year=>{
        Object.keys(store.dataDetail[`tolerance${tolerance}`][year]).forEach(month => {
            if (store.dataDetail[`tolerance${tolerance}`][year][month].includes(name))
                results += 1;
        });
    });
    return results;
}

const sortPerformersByCount = (tolerance=1, reverse=false) => {
    if (reverse)
        return store.allPerformers.sort((a, b) => (countPerformer(a, tolerance) > countPerformer(b, tolerance) ? -1 : 1))

    return store.allPerformers.sort((a, b) => (countPerformer(a, tolerance) > countPerformer(b, tolerance) ? 1 : -1))
}