function updateGraph(graphType, containerID, svgID) {

    d3.selectAll("#graphLine").remove();
    d3.select("#pointLabel").remove();

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
        .append("g")
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
        //const xScale = d3.scaleTime().range([9, width + 19]);
        //const xScale = d3.scaleLinear().range([0, width]);

        //Setting the x scale's domain. This determines what data is plotted against in the x-axis, which in this case is the time and date the measurement was taken. Both the CPU and RAM graph will have the same timescale so the x scale can be shared across both graphs.

        const now = new Date();

        /*
        let timeOffset;
        if (graphTimescale == "minute") {
            timeOffset = new Date(now.getTime() - 60000);
        }else if (graphTimescale == "hour") {
            timeOffset = new Date(now.getTime() - 3600000);
        }else if (graphTimescale == "day") {
            timeOffset = new Date(now.getTime() - 86400000);
        }else if (graphTimescale == "week") {
            timeOffset = new Date(now.getTime() - 604800000);
        }else if (graphTimescale == "month") {
            timeOffset = new Date(now.getTime() - 2592000000);
        }


        xScale.domain([timeOffset, now]);

         */
        xScale.domain(d3.extent(data, d => d.dateTime));

        //xScale.domain([0, 60]);








        const yScale = d3.scaleLinear().range([height, 0]);


        //Setting up the y-axis which is different depending on the graph
        if (graphType == "cpu") {
            //As the CPU utilisation will always be out of 100%, the highest value in the y-axis should be 100
            yScale.domain([0, 100]);



            //Plot the data on the graph with a line where every point should be plotted by the dateTime value on the x-axis and the cpu value on the y-axis
            line = d3.line()
                .x(d => xScale(d.dateTime))
                .y(d => yScale(d.cpu))

            //Broadly does the same as above except with RAM specific settings
        } else if (graphType == "ram") {
            yScale.domain([0, d3.max(data, d => d.ramTotal)]);

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





        //Code to add a rectangle giving specific readouts when hovering over a specific datapoint
        //Code adapted from https://www.youtube.com/watch?v=uyPYxx-WGxc

        /*
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip");


        const circle = svg.append("circle")
            .attr("r", 0)
            .attr("fill", "steelblue")
            .style("stroke", "white")
            .attr("opacity", 0.70)
            .style("pointer-events", "none")
            .attr("id", "pointLabel")




        const listeningRect = svg.append("rect")
            .attr("width", width)
            .attr("height", height);

        listeningRect.on("mousemove", function (event) {
            const [xCoord] = d3.pointer(event, this);
            const bisectDate= d3.bisector(d => d.dateTime).left;
            const x0 = xScale.invert(xCoord);
            const i = bisectDate(data, x0, 1);
            const d0 = data[i - 1];
            const d1 = data[i];
            const d = x0 - d0.dateTime > d1.dateTime - x0 ? d1 : d0;
            const xPos = xScale(d.dateTime);
            const yPos = yScale(d.cpu);

            circle.attr("cx", xPos)
                .attr("cy", yPos);

            circle.transition()
                .duration(50)
                .attr("r", 5);


            tooltip
                .style("display", "block")
                .style("left", '${xPos + 100}px')
                .style("top", '${yPos + 50}px')
                .html(`<strong>Date:</strong> ${d.dateTime}<br><strong>Utilisation:</strong> ${d.cpu + "%"}`)


        });

        listeningRect.on("mouseleave", function (){
           circle.transition()
               .duration(50)
               .attr("r", 0);
           tooltip.style("display", "none");
        });

         */
    });

}