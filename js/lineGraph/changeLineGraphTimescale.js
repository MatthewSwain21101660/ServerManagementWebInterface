function changeGraphTimescale(graphType, containerID, svgID) {
    let Interval;
//need to add if for which graph it is
    function startInterval(timescale) {
        drawLineGraph(graphType, containerID, timescale);
        if (Interval) {
            clearInterval(Interval); // Clear the existing interval if any
        }

        switch (timescale) {
            case "minute":
                updateLineGraph(graphType, containerID, svgID);
                Interval = setInterval(function () {
                    updateLineGraph(graphType, containerID, svgID);
                }, 1000); // 1 second interval for minute timescale
                break;

            case "hour":
                updateLineGraph(graphType, containerID, svgID);
                Interval = setInterval(function () {
                    updateLineGraph(graphType, containerID, svgID);
                }, 60000); // 1 minute interval for hour timescale
                break;

            case "day":
                updateLineGraph(graphType, containerID, svgID);
                Interval = setInterval(function () {
                    updateLineGraph(graphType, containerID, svgID);
                }, 3600000); // 1 hour interval for day timescale
                break;

            case "week":
                updateLineGraph(graphType, containerID, svgID);
                Interval = setInterval(function () {
                    updateLineGraph(graphType, containerID, svgID);
                }, 3600000); // 1 hour interval for day timescale
                break;

            case "month":
                updateLineGraph(graphType, containerID, svgID);
                Interval = setInterval(function () {
                    updateLineGraph(graphType, containerID, svgID);
                }, 86400000); // 1 hour interval for day timescale
                break;
        }
    }

    document.getElementById(graphType + "GraphTimescale").addEventListener("change", () => {
        const selectedTimescale = document.getElementById(graphType + "GraphTimescale").value;
        clearInterval(Interval); // Clear the existing interval
        startInterval(selectedTimescale); // Start a new interval based on the selected timescale
    });

    startInterval(document.getElementById(graphType + "GraphTimescale").value); // Initialize with a default timescale (e.g., "minute")
}