function updateGraph(graphType, graphTimescale, containerID, svgID) {
    d3.selectAll("path.line").remove();

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

        d3.selectAll("path.line").remove();









        const containerWidth = document.querySelector('.container').clientWidth;
        const width = containerWidth - margin.left - margin.right;

        // Update SVG dimensions
        d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        // Update scales
        xScale.range([0, width]);

        // Update axes
        svg.select(".x-axis")
            .call(d3.axisBottom(xScale).ticks(d3.timeMinute.every(1)));

        // Update line
        svg.select(".line")
            .attr("d", line);

        // Update points
        svg.selectAll(".dot")
            .attr("cx", d => x(d.dateTime))
            .attr("cy", d => y(d.cpu));

    });
}