const xScale = d3.scaleLinear().range([0, 60]).domain([0, 60]);
const yScale = d3.scaleLinear().range([0, 100]).domain([0, 100]);

const svg = d3.select("#cpuGraph")//.append("svg")
    .attr("width", 60)
    .attr("height", 100)




d3.json("http://localhost:9000/getUtil").then((data) => {
    data.forEach(d => {d.cpu = +d.cpu})

    svg
    .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", (d) => xScale(d.cpu))
        .attr("y", (d) => yScale(d.cpu))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => 100 - yScale(d.cpu));

});
