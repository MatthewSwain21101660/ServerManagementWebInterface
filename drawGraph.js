function drawGraph(containerID) {
    const containerDimensions = document.getElementById(containerID).getBoundingClientRect();
    const padding = {left: 40, right: 30, top: 20, bottom: 40};
    const width = containerDimensions.width - padding.left - padding.right;
    const height = 500 - padding.top - padding.bottom;

    const svg = d3.select("#" + containerID)
        .attr("width", width)
        .attr("height", height);

    const x_scale = d3.scaleBand().range([0, width]).padding(0.1);
    const y_scale = d3.scaleLinear().range([height, 0]);
    d3
        .json(
            "http://localhost:9000/getUtil"
        )
        .then(({data}) => {
            data.forEach((d) => (d.cpu = +d.cpu));

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
