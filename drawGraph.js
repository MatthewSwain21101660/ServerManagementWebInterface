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

        y.domain([0, 100]);



        switch (graphType) {
            case "cpu":
                y.domain([0, 100]);

                line = d3.line()
                    .x(d => x(d.dateTime))
                    .y(d => y(d.cpu));

                break;

            case "ram":
                y.domain([0, d3.max(data, d => d.ramTotal)]);

                line = d3.line()
                    .x(d => x(d.dateTime))
                    .y(d => y(d.ram));

                break;

        }





        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
            .ticks(d3.timeSecond.every(1))
            .tickFormat(d3.timeFormat("%S")));

        svg.append("g")
            .call(d3.axisLeft(y));




        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

    });
}