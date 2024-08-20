function drawLineGraph(graphType, containerID, timescale) {
    d3.selectAll("#" + graphType + "Graph").remove();

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

    //Retrieve data from the restful ServerManagement API. The timescale variable allows the user to vary over what period they want to see the data
    d3.json("http://localhost:9000/getUtil?timePeriod=" + timescale).then(function(data) {

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

        const now = new Date();

        //Attaches the x axis to the bottom of the page and gives time period appropriate ticks
        switch (timescale) {
            case "minute":
                svg.append("g")
                    .attr("id", "xAxis")
                    //Forces the x-axis to appear at the bottom of the svg
                    .attr("transform", "translate(0," + height + ")")
                    //Creates the x-axis with the previously creates values
                    .call(d3.axisBottom(xScale)
                        .tickValues([
                            new Date(now.getTime() - 60000),
                            new Date(now.getTime() - 45000),
                            new Date(now.getTime() - 30000),
                            new Date(now.getTime() - 15000),
                            new Date(now.getTime() - 1700)
                        ])
                        .tickFormat((d, i) => ["60 seconds ago", "45 seconds ago", "30 seconds ago", "15 seconds ago", "Now"][i]));

                svg.selectAll(".tick line").style("stroke-opacity", 0);
                break;

            case "hour":
                svg.append("g")
                    .attr("id", "xAxis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xScale)
                        .tickValues([
                            new Date(now.getTime() - 3500000),
                            new Date(now.getTime() - 2625000),
                            new Date(now.getTime() - 1750000),
                            new Date(now.getTime() - 875000),
                            new Date(now.getTime())
                        ])
                        .tickFormat((d, i) => ["60 minutes ago", "45 minutes ago", "30 minutes ago", "15 minutes ago", "Now"][i]));
                svg.selectAll(".tick line").style("stroke-opacity", 0);

                break;

            case "day":
                svg.append("g")
                    .attr("id", "xAxis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xScale)
                        .tickValues([
                            new Date(now.getTime() - 86400000),
                            new Date(now.getTime() - 64800000),
                            new Date(now.getTime() - 43200000),
                            new Date(now.getTime() - 21600000),
                            new Date(now.getTime())
                        ])
                        .tickFormat((d, i) => ["24 hours ago", "18 hours ago", "12 hours ago", "6 hours ago", "Now"][i]));
                svg.selectAll(".tick line").style("stroke-opacity", 0);
                break;

            case "week":
                svg.append("g")
                    .attr("id", "xAxis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xScale)
                        .tickValues([
                            new Date(now.getTime() - 604800000),
                            new Date(now.getTime() - 518400000),
                            new Date(now.getTime() - 432000000),
                            new Date(now.getTime() - 345600000),
                            new Date(now.getTime() - 259200000),
                            new Date(now.getTime() - 172800000),
                            new Date(now.getTime() - 86400000),
                            new Date(now.getTime())
                        ])
                        .tickFormat((d, i) => ["7 days ago", "6 days ago", "5 days ago", "4 days ago", "3 days ago", "2 days ago", "1 day ago", "Now"][i]));
                svg.selectAll(".tick line").style("stroke-opacity", 0);
                break;

            case "month":
                svg.append("g")
                    .attr("id", "xAxis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xScale)
                        .tickValues([
                            new Date(now.getTime() - 2419200000),
                            new Date(now.getTime() - 1814400000),
                            new Date(now.getTime() - 1209600000),
                            new Date(now.getTime() - 604800000),
                            new Date(now.getTime())
                        ])
                        .tickFormat((d, i) => ["4 weeks ago", "3 weeks ago", "2 weeks ago", "1 week ago", "Now"][i]));
                svg.selectAll(".tick line").style("stroke-opacity", 0);
                break;

        }

        const yScale = d3.scaleLinear().range([height, 0]);

        //Setting up the y-axis which is different depending on the graph
        if (graphType == "cpu") {
            //As the CPU utilisation will always be out of 100%, the highest value in the y-axis should be 100
            yScale.domain([0, 100]);

            //Create a new group to store y-axis related values
            svg.append("g")
                .attr("id", "yAxis")
                //Set the y-axis up with the values of the yScale variable
                .call(d3.axisLeft(yScale)
                    //Add a "%" symbol after all ticks in the y-axis
                    .tickFormat(d => {
                        return `${d}%`;
                    }))
        //Broadly does the same as above except with RAM specific settings
        }else if (graphType == "ram") {
            yScale.domain([0, d3.max(data, d => d.ramTotal)]);

            svg.append("g")
                .attr("id", "yAxis")
                .call(d3.axisLeft(yScale));
        }
        //Adds lines along the y axis ticks so the user can more easily tell what a particular data point corresponds to
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