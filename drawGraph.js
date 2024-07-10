function drawGraph(containerID, svgID, graphTimescale) {
    console.log(svgID);
    console.log(containerID);
    containerDimensions = document.getElementById(containerID).getBoundingClientRect();
    margin = {left: 40, right: 30, top: 20, bottom: 40};
    width = containerDimensions.width - margin.left - margin.right;
    height = 100 - margin.top - margin.bottom;

    svg = d3.select("#" + svgID)
        .attr("width", width)
        .attr("height", height);

    xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    switch (graphTimescale) {
        case "minute":
            xScale.domain([0, 60]);
    }
    yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]).domain([0, 100]);


    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale);

    svg.append("g").call(xAxis);//.call(yAxis);
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(yAxis)


    d3.json("http://localhost:9000/getUtil").then(({data}) => {
            data.forEach((d) => (d.cpu = +d.cpu));
            console.log("d");

            // Scale the range of the data in the domains
            x_scale.domain(data.map((d) => d.Name));
            y_scale.domain([0, d3.max(data, (d) => d.Population)]);

            // append the rectangles for the bar chart
            svg
                .selectAll("rect")
                .data(data)
                .join("rect")
                .attr("class", "bar")
                .attr("x", (d) => x_scale(d.Name))
                .attr("y", (d) => y_scale(d.Population))
                .attr("width", x_scale.bandwidth())
                .attr("height", (d) => height - y_scale(d.Population));
        });

}