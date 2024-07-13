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
                y.domain([0, 32]);

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



    /*




    switch (graphType) {
            case "cpu":
                xScale.domain(d3.extent(data, d => d.dateTime));
                yScale.domain([0, 100]);

                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xScale)
                        .ticks(d3.timeSecond.every(1))
                        .tickFormat(d3.timeFormat("%S")));

                svg.append("g")
                    .call(d3.axisLeft(yScale));

                const line = d3.line()
                    .xScale(d => xScale(d.dateTime))
                    .yScale(d => yScale(d.cpu));

                break;

            case "ram":
                xScale.domain(d3.extent(data, d => d.dateTime));
                yScale.domain([0, 32]);

                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xScale)
                        .ticks(d3.timeSecond.every(1))
                        .tickFormat(d3.timeFormat("%S")));

                svg.append("g")
                    .call(d3.axisLeft(yScale));

                const line = d3.line()
                    .xScale(d => xScale(d.dateTime))
                    .yScale(d => yScale(d.cpu));

                break;
        }

















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

     */
}