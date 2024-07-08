const el = d3.select("#cpuGraph");

d3.json("ServerManagementDB.HardwareReadings.json").then((data) => {
    el
        .selectAll("p")
        .data(data)
        .join("p")
        .text((d) => d.dateTime)
});