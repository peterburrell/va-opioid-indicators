// todo: process data when loaded
// todo: fix data display
// todo: fix map color scheme

// https://bl.ocks.org/mbostock/4060606
// http://dc-js.github.io/dc.js/examples/
// https://blog.sicara.com/interactive-dashboard-crossfilter-dcjs-tutorial-7f3a3ea584c2
// https://gist.github.com/mbostock/7061976
// http://www.vdh.virginia.gov/data/opioid-overdose/

let mapWidth = 1140,
    mapHeight = 600;

let colors = d3.scaleLinear(d3.schemeBlues[9]);

let projection = d3.geoConicConformal()
    .parallels([38 + 02 / 60, 39 + 12 / 60])
    .rotate([78 + 30 / 60, 0])
    .scale(8000)
    .translate([0, 0]);

let path = d3.geoPath()
    .projection(projection);

Promise.all([d3.json("va-counties.json"), d3.csv("dataset.csv")]).then(render);

function render(files) {

    let topo = files[0];
    let data = files[1];

    console.log("first row", data[0]);
    console.log("topojson", topo);

    let state = topojson.feature(topo, topo.objects.states);
    let bounds = path.bounds(state);

    projection
        .translate([mapWidth / 2 - (bounds[0][0] + bounds[1][0]) / 2, mapHeight / 2 - (bounds[0][1] + bounds[1][1]) / 2]);

    let cf = crossfilter(data);

    let dim_year = cf.dimension(d => d["Year"]);
    let dim_age = cf.dimension(d => d["Age Group"]);
    let dim_county = cf.dimension(d => d["Locality"]);
    let dim_fips = cf.dimension(d => d["FIPS Code"]);
    let dim_type = cf.dimension(d => d["Type"]);

    dc.selectMenu("#select-year")
        .dimension(dim_year)
        .group(dim_year.group())
        .on("renderlet", chart => chart.select("select").classed("form-control", true));

    dc.selectMenu("#select-age-group")
        .dimension(dim_age)
        .group(dim_age.group())
        .on("renderlet", chart => chart.select("select").classed("form-control", true));

    dc.selectMenu("#select-county")
        .dimension(dim_county)
        .group(dim_county.group())
        .on("renderlet", chart => chart.select("select").classed("form-control", true));
        
    dc.selectMenu("#select-type")
        .dimension(dim_type)
        .group(dim_type.group())
        .on("renderlet", chart => chart.select("select").classed("form-control", true));

    dc.dataTable("#datatable")
        .dimension(dim_year)
        .group(d => d["Year"])
        .size(500)
        .columns(["Year", "Age Group", "Locality", "Type", "Case Count Display", "Rate"])
        .showGroups(false);

    dc.geoChoroplethChart("#map")
        .width(mapWidth)
        .height(mapHeight)
        .dimension(dim_fips)
        .group(dim_fips.group().reduceSum(d => (d["Case Count Display"]|0)))
        .colorAccessor(colors)
        .overlayGeoJson(topojson.feature(topo, topo.objects.counties).features, "state", d => d.id)
        .projection(projection);

    dc.renderAll();
}

