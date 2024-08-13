function changeGraphTimescale(graphType, containerID, svgID) {

    //Declaring outside of any context so can be used in any context
    let Interval;

    function startInterval(timescale) {
        //Draws the initial axis
        drawLineGraph(graphType, containerID, timescale);

        //If an interval already exists, clears it so there are not conflicting lines being drawn
        if (Interval) {
            clearInterval(Interval); // Clear the existing interval if any
        }

        switch (timescale) {
            //If the selected timescale is a minute, refreshes the line every second
            case "minute":
                updateLineGraph(graphType, containerID, svgID);
                Interval = setInterval(function () {
                    updateLineGraph(graphType, containerID, svgID);
                }, 1000);
                break;

            //If the selected timescale is an hour, refreshes the line every minute
            case "hour":
                updateLineGraph(graphType, containerID, svgID);
                Interval = setInterval(function () {
                    updateLineGraph(graphType, containerID, svgID);
                }, 60000);
                break;

            //If the selected timescale is a day, refreshes the line every hour
            case "day":
                updateLineGraph(graphType, containerID, svgID);
                Interval = setInterval(function () {
                    updateLineGraph(graphType, containerID, svgID);
                }, 3600000);
                break;

            //If the selected timescale is a week, refreshes the line every hour
            case "week":
                updateLineGraph(graphType, containerID, svgID);
                Interval = setInterval(function () {
                    updateLineGraph(graphType, containerID, svgID);
                }, 3600000);
                break;

            //If the selected timescale is a month, refreshes the line every day
            case "month":
                updateLineGraph(graphType, containerID, svgID);
                Interval = setInterval(function () {
                    updateLineGraph(graphType, containerID, svgID);
                }, 86400000);
                break;
        }
    }

    //When the selects are changed, the startInterval method is called again so the line can be redrawn over different time periods
    document.getElementById(graphType + "GraphTimescale").addEventListener("change", () => {
        const selectedTimescale = document.getElementById(graphType + "GraphTimescale").value;
        startInterval(selectedTimescale);
    });

    //Kickstarts the startInterval method as otherwise, the graph will not be drawn until the user changes the select
    startInterval(document.getElementById(graphType + "GraphTimescale").value);
}