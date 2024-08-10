function drawAreaGraph(graphType, containerID) {
console.log(containerID);


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

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")


    const xScale = d3.scaleTime()
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .range([height, 0]);


    //d3.select("#cpuGraph").remove();
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

        xScale.domain(d3.extent(data, d => d.dateTime));

        if (graphType == "cpu") {
            yScale.domain([0, 100]);
        }else if (graphType == "ram") {
            yScale.domain([0, d3.max(data, d => d.ramTotal)]);
        }

        svg.append("g")
            .attr("id", "xAxis")
            .call(d3.axisBottom(xScale))
            .attr("transform", `translate(0,${height})`);

        svg.append("g")
            .attr("id", "yAxis")
            .call(d3.axisLeft(yScale));

        const line = d3.line()
        .x(d => xScale(d.dateTime))
        .y(d => yScale(d[graphType]));

        const area = d3.area()
            .x(d => xScale(d.dateTime))
            .y0(height)
            .y1(d => yScale(d[graphType]));

        svg.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area)
            .style("fill", "#85bb65")
            .style("opacity", 0.5);

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#85bb65")
            .attr("stroke-width", 1)
            .attr("d", line);

        const circle = svg.append("circle")
            .attr("r", 0)
            .attr("fill", "steelblue")
            .style("stroke", "white")
            .attr("opacity", 0.7)
            .style("pointer-events", "none");

        const listeningRect = svg.append("rect")
            .attr("width", width)
            .attr("height", height);

        listeningRect.on("mousemove", function (event) {
            const [xCoord] = d3.pointer(event, this);
            const bisectDate = d3.bisector(d => d.dateTime).left;
            const x0 = xScale.invert(xCoord);
            const i = bisectDate(data, x0, 1);
            const d0 = data[i - 1];
            const d1 = data[i];
            const d = x0 - d0.dateTime > d1.dateTime - x0 ? d1 : d0;
            const xPos = xScale(d.dateTime);
            const yPos = yScale(d[graphType]);

            circle.attr("cx", xPos)
                .attr("cy", yPos);


            circle.transition()
                .duration(50)
                .attr("r", 5);

            tooltip
                .style("display", "block")
                .style("left", `${xPos + 60}px`)
                .style("top", `${yPos + 50}px`)
                .html(`<strong>Date:</strong> ${d.dateTime}<br><strong>Utilisation:</strong> ${d.cpu + "%"}`)
        });

        listeningRect.on("mouseleave", function () {
            circle.transition()
                .duration(50)
                .attr("r", 0);
            tooltip.style("display", "none");
        })

        const sliderRange = d3
            .sliderBottom()
            .min(d3.min(data, d => d.dateTime))
            .max(d3.max(data, d => d.dateTime))
            .width(1670)
            .tickFormat(d3.timeFormat("%Y/%m/%d %H:%M:%S"))
            .ticks(3)
            .default([d3.min(data, d => d.dateTime), d3.max(data, d => d.dateTime)])
            .fill("#85bb65");

        sliderRange.on("onchange", val => {
            xScale.domain(val);

            const filteredData = data.filter(d => d.dateTime >= val[0] && d.dateTime <= val[1]);

            svg.select(".line").attr("d", line(filteredData));
            svg.select(".area").attr("d", area(filteredData));

            //yScale.domain([0, d3.max(filteredData, d => d.dateTime)]);

            svg.select("#xAxis")
                .transition()
                .duration(300)
                .call(d3.axisBottom(xScale));

            svg.select("#yAxis")
            .transition()
            .duration(300)
                .call(d3.axisLeft(yScale));
        });

        const gRange = d3
            .select("#sliderRange")
            .append("svg")
            .attr("width", 2000)
            .attr("height", 100)
            .append("g")
            .attr("transform", "translate(90,30)");

        gRange.call(sliderRange);
    });
}