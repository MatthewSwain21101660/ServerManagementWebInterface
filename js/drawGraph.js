function drawGraph(graphType, containerID) {

    d3.selectAll("#" + graphType + "Graph").remove();

    graphTimescale = document.getElementById(graphType + "GraphTimescale").value;
    console.log(graphTimescale);

    //Get the dimensions of the container that the graph will be created in
    containerDimensions = document.getElementById(containerID).getBoundingClientRect();
    //Specifying how far away the graph will be from the sides of the container
    margin = {left: 40, right: 30, top: 20, bottom: 140};
    //Creating variables that can be used to specify dimensions during creation
    width = containerDimensions.width - margin.left - margin.right;
    height = containerDimensions.height - margin.top - margin.bottom;

    //Create SVG
    const svg = d3.select("#" + containerID)
        .append("svg")
        .attr("id", graphType + "Graph")
        //Creating the svg to be the same size as the container it is held in
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        //Adding a g tag to the svg for the various graph elements to be grouped in
        .append("g")
        //Adding margins to the svg for style and so graph labels can be added
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");




//svg.selectAll(".").remove();

    //d3.select("#cpuGraph").remove();
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

        //const xScale = d3.scaleLinear().range([0, width]);

        //Setting the x scale's domain. This determines what data is plotted against in the x-axis, which in this case is the time and date the measurement was taken. Both the CPU and RAM graph will have the same timescale so the x scale can be shared across both graphs.
        xScale.domain(d3.extent(data, d => d.dateTime));

        //xScale.domain([0, 60]);



        const now = new Date();



        switch (graphTimescale) {
            case "minute":
                svg.append("g")
                    //Forces the x-axis to appear at the bottom of the svg
                    .attr("transform", "translate(0," + height + ")")
                    //Creates the x-axis with the previously creates values
                    .call(d3.axisBottom(xScale)
                        .tickValues([
                            new Date(now.getTime() - 60000),
                            new Date(now.getTime() - 45000),
                            new Date(now.getTime() - 30000),
                            new Date(now.getTime() - 15000)
                        ])
                        .tickFormat((d, i) => ["60 seconds ago", "45 seconds ago", "30 seconds ago", "15 seconds ago", "Now"][i]));

                svg.selectAll(".tick line").style("stroke-opacity", 0);
                break;

            case "hour":
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xScale));
                        //.ticks(d3.timeMinute.every(10))
                        //.tickFormat(d3.timeFormat("%H:%M:%S")));
                svg.selectAll(".tick line").style("stroke-opacity", 0);
                svg.selectAll("text").remove();
                break;

            case "day":
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xScale)
                        .ticks(d3.timeMinute.every(720))
                        .tickFormat(d3.timeFormat("%H:%M:%S")));
                svg.selectAll(".tick line").style("stroke-opacity", 0);
                svg.selectAll("text").remove();
                break;

            case "week":
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xScale)
                        .ticks(d3.timeMinute.every(720))
                        .tickFormat(d3.timeFormat("%H:%M:%S")));
                svg.selectAll(".tick line").style("stroke-opacity", 0);
                svg.selectAll("text").remove();
                break;

            case "month":
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xScale)
                        .ticks(d3.timeMinute.every(10))
                        .tickFormat(d3.timeFormat("%H:%M:%S")));
                svg.selectAll(".tick line").style("stroke-opacity", 0);
                svg.selectAll("text").remove();
                break;

        }











        const yScale = d3.scaleLinear().range([height, 0]);




        //Setting up the y-axis which is different depending on the graph
        if (graphType == "cpu") {
            //As the CPU utilisation will always be out of 100%, the highest value in the y-axis should be 100
            yScale.domain([0, 100]);

            //Create a new group to store y-axis related values
            svg.append("g")
                //Set the y-axis up with the values of the yScale variable
                .call(d3.axisLeft(yScale)
                    //Add a "%" symbol after all ticks in the y-axis
                    .tickFormat(d => {
                        return `${d}%`;
                    }))

            //Plot the data on the graph with a line where every point should be plotted by the dateTime value on the x-axis and the cpu value on the y-axis
            line = d3.line()
                .x(d => xScale(d.dateTime))
                .y(d => yScale(d.cpu))

            //Broadly does the same as above except with RAM specific settings
        }else if (graphType == "ram") {
            yScale.domain([0, d3.max(data, d => d.ramTotal)]);

            svg.append("g")
                .call(d3.axisLeft(yScale));

            line = d3.line()
                .x(d => xScale(d.dateTime))
                .y(d => yScale(d.ram));
        }





/*
        //Creates a faint grid behind the plotted points
        svg.selectAll("xGrid")
            .data(xScale.ticks().slice(1))
            .join("line")
            .attr("x1", d => xScale(d))
            .attr("x2", d => xScale(d))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "#6b6c6c")
            .attr("stroke-width", .5);

 */



    });
}