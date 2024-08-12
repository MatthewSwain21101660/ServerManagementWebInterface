function updateLineGraph(graphType, containerID, svgID) {
    graphTimescale = (document.getElementById(graphType + "GraphTimescale").value).toString();

    //Get the dimensions of the container that the graph will be created in
    containerDimensions = document.getElementById(containerID).getBoundingClientRect();
    //Specifying how far away the graph will be from the sides of the container
    margin = {left: 40, right: 30, top: 20, bottom: 140};
    //Creating variables that can be used to specify dimensions during creation
    width = containerDimensions.width - margin.left - margin.right;
    height = containerDimensions.height - margin.top - margin.bottom;

    //Create SVG
    const svg = d3.select("#" + svgID)
        //Creating the svg to be the same size as the container it is held in
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        //Adding a g tag to the svg for the various graph elements to be grouped in
        .select("g")
        //Adding margins to the svg for style and so graph labels can be added
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");




    //Retrieve data from the restful ServerManagement API. The graphTimescale variable allows the user to vary over what period they want to see the data
    d3.json("http://localhost:9000/getUtil?timePeriod=" + graphTimescale).then(function(data) {

        //Defining the format the date is in
        const parseDate = d3.timeParse("%Y/%m/%d %H:%M:%S");

        //For every JSON entry, the following values are retrieved and converted into values d3 can use
        data.forEach(d => {
            d.dateTime = parseDate(d.dateTime);
            d.cpu = +d.cpu;
            d.ram = +d.ram;
            d.ramTotal = +d.ramTotal;
        })

        //Defining the range of the x and y scales, i.e. how big the charts should appear on the page. The width and height variables are used to prevent the chart becoming bigger than its container
        const xScale = d3.scaleTime().range([0, width]);

        //Setting the x scale's domain. This determines what data is plotted against in the x-axis, which in this case is the time and date the measurement was taken. Both the CPU and RAM graph will have the same timescale so the x scale can be shared across both graphs.
        xScale.domain(d3.extent(data, d => d.dateTime));

        const yScale = d3.scaleLinear().range([height, 0]);


        //Setting up the y-axis which is different depending on the graph
        if (graphType == "cpu") {
            //As the CPU utilisation will always be out of 100%, the highest value in the y-axis should be 100
            yScale.domain([0, 100]);



            updatedLine = d3.line()
                .x(d => xScale(d.dateTime))
                .y(d => yScale(d.cpu));

        //Broadly does the same as above except with RAM specific settings
        } else if (graphType == "ram") {
            yScale.domain([0, d3.max(data, d => d.ramTotal)]);

            updatedLine = d3.line()
                .x(d => xScale(d.dateTime))
                .y(d => yScale(d.ram));
        }

        // Bind data and transition the line path
        let path = svg.selectAll("path#line-" + graphType)
            .data([data]);

        path.enter()
            .append("path")
            .attr("id", "line-" + graphType)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .merge(path)
            .transition()
            .duration(750)
            .attr("d", updatedLine);

        // Optionally: Update or add gridlines
        svg.selectAll("line.yGrid")
            .data(yScale.ticks().slice(1))
            .join("line")
            .attr("class", "yGrid")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .attr("stroke", "#6b6c6c")
            .attr("stroke-width", .5);
    });
}

/*

    //Create SVG
    const svg = d3.select("#" + svgID)
        //Creating the svg to be the same size as the container it is held in
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        //Adding a g tag to the svg for the various graph elements to be grouped in
        .append("g")
        //Adding margins to the svg for style and so graph labels can be added
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");




        //Setting up the y-axis which is different depending on the graph
        if (graphType == "cpu") {
            //As the CPU utilisation will always be out of 100%, the highest value in the y-axis should be 100
            yScale.domain([0, 100]);

/*
            svg.select("#line")
                .transition()
                .duration(300)
                .call(d3.line().x(d => xScale(d.dateTime)).y(d => yScale(d.cpu)));


line = d3.line()
    .x(d => xScale(d.dateTime))
    .y(d => yScale(d.cpu));

//Broadly does the same as above except with RAM specific settings
} else if (graphType == "ram") {
    yScale.domain([0, d3.max(data, d => d.ramTotal)]);

    /*svg.select("#line")
        .transition()
        .duration(300)
        .call(d3.line().x(d => xScale(d.dateTime)).y(d => yScale(d.cpu)));


    line = d3.line()
        .x(d => xScale(d.dateTime))
        .y(d => yScale(d.ram));


}
svg.selectAll("path.line").remove();

//Creates a line between the plotted points
svg.append("path")
    .datum(data)
    .attr("id", "graphLine")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);




svg.selectAll("yGrid")
    .data(yScale.ticks().slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", d => yScale(d))
    .attr("y2", d => yScale(d))
    .attr("stroke", "#6b6c6c")
    .attr("stroke-width", .5);

});

 */

