function drawAreaGraph(graphType, containerID) {
    //Remove any existing elements if the page has been resized
    d3.selectAll("#" + graphType + "areaGraph").remove();
    d3.selectAll("#slider").remove();

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
        .attr("id", graphType + "areaGraph")
        //Creating the svg to be the same size as the container it is held in
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        //Adding a g tag to the svg for the various graph elements to be grouped in
        .append("g")
        //Adding margins to the svg for style and so graph labels can be added
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Create an initial empty tooltip class for editing later on
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")

    //Initialising the scales
    const xScale = d3.scaleTime()
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .range([height, 0]);


    //Retrieve data from the restful ServerManagement API. The graphTimescale variable allows the user to vary over what period they want to see the data
    d3.json("http://localhost:9000/getUtil?timePeriod=all").then(function(data) {
        //Defining the format the date is in
        const parseDate = d3.timeParse("%Y/%m/%d %H:%M:%S");

        //For every JSON entry, the following values are retrieved and converted into values d3 can use
        data.forEach(d => {
            d.dateTime = parseDate(d.dateTime);
            d.cpu = +d.cpu;
            d.ram = +d.ram;
            d.ramTotal = +d.ramTotal;
        })

        //Setting the x Scale which will be the same on either graph
        xScale.domain(d3.extent(data, d => d.dateTime));

        //Setting the y axis which is different for each graph
        if (graphType == "cpu") {
            yScale.domain([0, 100]);
        }else if (graphType == "ram") {
            yScale.domain([0, d3.max(data, d => d.ramTotal)]);
        }

        //Attaching the x and y axis to the container
        svg.append("g")
            .attr("id", "xAxis")
            .call(d3.axisBottom(xScale))
            .attr("transform", `translate(0,${height})`);

        svg.append("g")
            .attr("id", "yAxis")
            .call(d3.axisLeft(yScale));

        //Creating a line and an area under the line that is filled in
        const line = d3.line()
        .x(d => xScale(d.dateTime))
        .y(d => yScale(d[graphType]));

        const area = d3.area()
            .x(d => xScale(d.dateTime))
            .y0(height)
            .y1(d => yScale(d[graphType]));

        //Attaching the line and area to the container so that they can be seen
        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1)
            .attr("d", line);

        svg.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area)
            .style("fill", "steelblue")
            .style("opacity", 0.5);

        //Code to add a rectangle giving specific readouts when hovering over a specific datapoint
        //Code adapted from https://www.youtube.com/watch?v=uyPYxx-WGxc

        //Creating and attaching a circle that shows what the cursor is hovering over. Initially the radius is set to 0 so cannot be seen
        const circle = svg.append("circle")
            .attr("fill", "steelblue")
            .style("stroke", "white")
            .attr("opacity", 0.7)
            .style("pointer-events", "none");

        //Creating and attaching a rectangle that will give the user more in depth detail. Also initially does not have any visibility attributes set so cannot be seen
        const infoBox = svg.append("rect")
            .attr("width", width)
            .attr("height", height);

        //When the mouse moves, this function finds the closest data point to the position of the mouse
        infoBox.on("mousemove", function (event) {
            const [xCoord] = d3.pointer(event, this);
            const bisectDate = d3.bisector(d => d.dateTime).left;
            const x0 = xScale.invert(xCoord);
            const i = bisectDate(data, x0, 1);
            const d0 = data[i - 1];
            const d1 = data[i];
            const d = x0 - d0.dateTime > d1.dateTime - x0 ? d1 : d0;
            const xPos = xScale(d.dateTime);
            const yPos = yScale(d[graphType]);

            //Sets the position of the previously created circle to the coordinates of the data point that is nearest to the mouse
            circle.attr("cx", xPos)
                .attr("cy", yPos);

            //Quickly makes the circle visible
            circle.transition()
                .duration(50)
                .attr("r", 5);

            //Makes the previously declared rectangle visible and displays the detailed information that is appropriate for the graph
            if (graphType == "cpu") {
                tooltip
                    .style("display", "block")
                    .style("left", `${xPos + 60}px`)
                    .style("top", `${yPos + 50}px`)
                    .html(`<strong>Date:</strong> ${d.dateTime}<br><strong>CPU Utilisation:</strong> ${d.cpu + "%"}`)
            }else if (graphType == "ram") {
                tooltip
                    .style("display", "block")
                    .style("left", `${xPos + 60}px`)
                    .style("top", `${yPos + 50}px`)
                    .html(`<strong>Date:</strong> ${d.dateTime}<br><strong>RAM Utilisation:</strong> ${d.ram + "/" + d.ramTotal}`)
            }
        });

        //When the mouse leaves the graph altogether, the circle and info box are removed so they are not left when the mouse isnt hovering over anything
        infoBox.on("mouseleave", function () {
            circle.transition()
                .duration(50)
                .attr("r", 0);
            tooltip.style("display", "none");
        })

        //Adds a slider at the bottom of the page that displays all of the stored readings
        const sliderRange = d3
            .sliderBottom()
            .min(d3.min(data, d => d.dateTime))
            .max(d3.max(data, d => d.dateTime))
            .width(1670)
            .tickFormat(d3.timeFormat("%Y/%m/%d"))
            .ticks(12)
            .default([d3.min(data, d => d.dateTime), d3.max(data, d => d.dateTime)])
            .fill("steelblue");

        //When the slider is adjusted, the x Scale is adjusted so the user can narrow down what data they want to see
        sliderRange.on("onchange", val => {
            xScale.domain(val);

            const filteredData = data.filter(d => d.dateTime >= val[0] && d.dateTime <= val[1]);

            //Redraws the line and area to fit with the new scale
            svg.select(".line").attr("d", line(filteredData));
            svg.select(".area").attr("d", area(filteredData));

            //Transitions the x axis to its new range
            svg.select("#xAxis")
                .transition()
                .duration(300)
                .call(d3.axisBottom(xScale));
        });

        //Attaches the slider to the bottom of the page for the user to use
        const gRange = d3
            .select("#sliderRange")
            .append("svg")
            .attr("id", "slider")
            .attr("width", 2000)
            .attr("height", 100)
            .append("g")
            .attr("transform", "translate(90,30)");

        gRange.call(sliderRange);
    });
}