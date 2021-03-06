const load = () => {
    const getLocationsByYear = () => {
        let _ = {};
        [...new Set(store.raw.map((d) => d.year))].forEach((year) => {
            _[year] = store.raw
                .filter((d) => d.year == year)
                .map((d) => `${d.lon}, ${d.lat}`);
        });

        let returnVal = {};
        for (const [year, locations] of Object.entries(_)) {
            returnVal[year] = locations.reduce(function (acc, curr) {
                if (typeof acc[curr] == "undefined") {
                    acc[curr] = 1;
                } else {
                    acc[curr] += 1;
                }

                return acc;
            }, {});
        }

        return returnVal;
    };

    const setupMap = () => {
        d3.json(DATA_DIR + "/us.json").then((json) => {
            renderMap(json);
        });
        d3.json(DATA_DIR + "/USA_Major_Cities.geojson").then((cities) => {
            renderCities(cities);
        });
    };

    const networkCleanup = (data) => {
        p = d3.timeParse('%Y-%m-%d %H:%M:%S')
        data.createdDate = p(data.createdDate);
        data.days = +data.days;
        return data;
    }
    const setupNetworkData = () => {
        d3.json(
            DATA_DIR + "/v1-co-occurrence-grouped-by-14-days-no-unnamed-performers.json"
        )
            .then((data) => {
                data = networkCleanup(data);
                store.networkData = data;
                console.log(DATA_DIR + "/v1-co-occurrence-grouped-by-14-days-no-unnamed-performers.json loaded.....!!!!")
            })
            .then(() => {
                store.modularitiesArray = store.networkData.nodes.map(
                    (node) => [node.id, node.modularities.Louvain]
                );
                clusters = [
                    ...new Set(store.modularitiesArray.map((n) => n[1])),
                ];
                store.clusterColors = {};
                colorScale = d3.scaleLinear().domain([0, clusters.length]);
                clusters.forEach((cluster) => {
                    color = d3.interpolateYlGnBu(colorScale(cluster + 1));
                    color = d3.rgb(color).darker(0.3);
                    store.clusterColors[cluster + 1] = color;
                    store.clusters[cluster + 1] = store.modularitiesArray
                        .filter((n) => n[1] == cluster)
                        .map((n) => n[0]);
                });
                setupClusterNav();
            });
    };
    setupNetworkData();

    const setupStore = (data) => {
        store.raw = data;
        store.minYear = +d3.min(store.raw, (d) => d.year);
        store.maxYear = +d3.max(store.raw, (d) => d.year);
        store.locationsByYear = getLocationsByYear();

        store.locationsCount = {};
        d3.range(store.minYear, store.maxYear + 1).forEach((year) => {
            store.locationsByYear[year] = store.locationsByYear[year];
            Object.keys(store.locationsByYear).map((key, outer_ix) => {
                Object.keys(store.locationsByYear[key]).map(
                    (lonLat, inner_ix) => {
                        locationCount = store.locationsByYear[key][lonLat];
                        if (!hasKey(lonLat, store.locationsCount))
                            store.locationsCount[lonLat] = 0;

                        store.locationsCount[lonLat] += locationCount;
                    }
                );
            });
        });

        store.locationYearPair = {};
        Object.entries(store.locationsByYear).forEach((entry) => {
            [year, data] = entry;
            if (!hasKey(year, store.locationYearPair))
                store.locationYearPair[year] = {};
            Object.entries(data).forEach((entry) => {
                [lonLat, count] = entry;
                store.locationYearPair[year][lonLat] = count;
            });
        });
    };
    
    const performerTypes = (d) => {
        return {
            city: d.city,
            lat: +d.lat,
            lon: +d.lon,
            performer: d.performer,
            year: +d.year
        }
    }
    d3.csv(DATA_DIR + "/geolocated_performers.csv", performerTypes)
        .then((data) => {
            setupStore(data);
        })
        .then(() => {
            setupMap();
            setupSlider();
            setupDropdown();
            renderCircles();
        });
};

const getMaxYearMinYear = () => {
    testSlider = slider.noUiSlider.get();
    if (testSlider) {
        [minYear, maxYear] = testSlider;
    } else {
        console.warn("No minYear and maxYear so setting to extremes");
        minYear = store.minYear;
        maxYear = store.maxYear;
    }
    return [minYear, maxYear];
};

load();
