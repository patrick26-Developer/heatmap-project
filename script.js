const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(url).then(data => {
    const baseTemp = data.baseTemperature;
    const values = data.monthlyVariance;

    const width = 1000;
    const height = 500;
    const padding = 60;

    const svg = d3.select("#heatmap")
                  .attr("width", width)
                  .attr("height", height);

    const xScale = d3.scaleBand()
                     .domain(values.map(d => d.year))
                     .range([padding, width - padding])
                     .padding(0.1);

    const yScale = d3.scaleBand()
                     .domain([...Array(12).keys()])
                     .range([padding, height - padding])
                     .padding(0.1);

    const xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter(year => year % 10 === 0));
    const yAxis = d3.axisLeft(yScale).tickFormat(month => {
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        return months[month];
    });

    svg.append("g")
       .attr("id", "x-axis")
       .attr("transform", `translate(0,${height - padding})`)
       .call(xAxis);

    svg.append("g")
       .attr("id", "y-axis")
       .attr("transform", `translate(${padding},0)`)
       .call(yAxis);

    const colorScale = d3.scaleQuantize()
                         .domain(d3.extent(values, d => d.variance))
                         .range(["#4575b4", "#74add1", "#abd9e9", "#fee090", "#fdae61", "#d73027"]);

    svg.selectAll(".cell")
       .data(values)
       .enter()
       .append("rect")
       .attr("class", "cell")
       .attr("data-month", d => d.month - 1)
       .attr("data-year", d => d.year)
       .attr("data-temp", d => baseTemp + d.variance)
       .attr("x", d => xScale(d.year))
       .attr("y", d => yScale(d.month - 1))
       .attr("width", xScale.bandwidth())
       .attr("height", yScale.bandwidth())
       .attr("fill", d => colorScale(d.variance))
       .on("mouseover", (event, d) => {
           d3.select("#tooltip")
             .style("display", "block")
             .style("left", event.pageX + "px")
             .style("top", event.pageY - 50 + "px")
             .html(`Année: ${d.year} <br> Mois: ${d.month} <br> Température: ${(baseTemp + d.variance).toFixed(2)}°C`);
       })
       .on("mouseout", () => {
           d3.select("#tooltip").style("display", "none");
       });

    const legend = d3.select("#legend")
                     .attr("width", 500)
                     .attr("height", 50);

    const legendScale = d3.scaleBand()
                          .domain(colorScale.range())
                          .range([20, 480]);

    legend.selectAll(".legend-item")
          .data(colorScale.range())
          .enter()
          .append("rect")
          .attr("class", "legend-item")
          .attr("x", d => legendScale(d))
          .attr("y", 10)
          .attr("width", legendScale.bandwidth())
          .attr("height", 20)
          .attr("fill", d => d);
});