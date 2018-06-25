let svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

let colors = d3.scaleLinear(d3.schemeBlues[9]);

let projection = d3.geoConicConformal()
    .parallels([38 + 02 / 60, 39 + 12 / 60])
    .rotate([78 + 30 / 60, 0])
    .scale(8000)
    .translate([0, 0]);

let path = d3.geoPath()
    .projection(projection);

Promise.all([d3.json("va-counties.json"), d3.csv("dataset.csv")]).then(ready);

function ready(files) {

    let topo = files[0];
    let data = files[1];

    console.log("first row", data[0]);
    console.log("topojson", topo);

    let state = topojson.feature(topo, topo.objects.states);
    let bounds = path.bounds(state);

    projection
        .translate([width / 2 - (bounds[0][0] + bounds[1][0]) / 2, height / 2 - (bounds[0][1] + bounds[1][1]) / 2]);

    let cf = crossfilter(data);

    window.cf = cf;

    let dim_year = cf.dimension(d => d["Year"]);
    let dim_age = cf.dimension(d => d["Age Group"]);
    let dim_fips = cf.dimension(d => d["FIPS Code"]);
    let dim_type = cf.dimension(d => d["Type"]);

    d3.select("#loading-msg").remove();
    d3.select("#content").classed("invisible", false);

    svg.append("g")
            .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(topo, topo.objects.counties).features)
        .enter().append("path")
            //.attr("fill", function (d) { return color(d.rate = unemployment.get(d.id)); })
            .attr("d", path)
        .append("title");
            //.text(function (d) { return d.rate + "%"; });

    svg.append("path")
        .datum(state)
        .attr("class", "state")
        .attr("d", path);

    // svg.append("path")
    //     .datum(topojson.mesh(topo, topo.objects.counties, function(a, b) { return a !== b; }))
    //     .attr("class", "counties")
    //     .attr("d", path);        
}

