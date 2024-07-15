function drawGraph(graphType, graphTimescale, containerID, svgID) {
    containerDimensions = document.getElementById(containerID).getBoundingClientRect();
    margin = {left: 40, right: 30, top: 20, bottom: 100};
    width = containerDimensions.width - margin.left - margin.right;
    height = containerDimensions.height - margin.top - margin.bottom;

//Create SVG
    const svg = d3.select("#" + svgID)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    d3.json("http://localhost:9000/getUtil").then(function(data) {

        const parseDate = d3.timeParse("%Y/%m/%d %H:%M:%S");
        data.forEach(d => {
            d.dateTime = parseDate(d.dateTime);
            d.cpu = +d.cpu;
            d.ram = +d.ram;
            d.ramTotal = +d.ramTotal;
        })

        console.log(data);

        const x = d3.scaleTime().range([0, width]);

        const y = d3.scaleLinear().range([height, 0]);

        x.domain(d3.extent(data, d => d.dateTime));




        switch (graphType) {
            case "cpu":
                y.domain([0, 100]);

                svg.append("g")
                    .call(d3.axisLeft(y)
                        .tickFormat(d => { return `${d}%`;}))

                line = d3.line()
                    .x(d => x(d.dateTime))
                    .y(d => y(d.cpu));
                break;

            case "ram":
                y.domain([0, d3.max(data, d => d.ramTotal)]);

                svg.append("g")
                    .call(d3.axisLeft(y));

                line = d3.line()
                    .x(d => x(d.dateTime))
                    .y(d => y(d.ram));

                break;

        }




        switch (graphTimescale) {
            case "minute":
                svg.append("g")
                        .attr("transform", "translate(0," + height + ")")
                        .call(d3.axisBottom(x)
                        .ticks(d3.timeSecond.every(10))
                        .tickFormat(d3.timeFormat("%H:%M:%S")));
                break;

        }




        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        svg.selectAll("xGrid")
            .data(x.ticks().slice(1))
            .join("line")
            .attr("x1", d => x(d))
            .attr("x2", d => x(d))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "#6b6c6c")
            .attr("stroke-width", .5);

        svg.selectAll("yGrid")
            .data(y.ticks().slice(1))
            .join("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d => y(d))
            .attr("y2", d => y(d))
            .attr("stroke", "#6b6c6c")
            .attr("stroke-width", .5);

    });
}