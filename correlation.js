/* correlation.js */
d3.json("movies.json").then(data => {
    console.log("Data loaded:", data);

    let movies = data.map(movie => {
        movie.rank = +movie.rank;
        movie.duration = +movie.duration;
        movie.votes = +movie.votes;
        movie.rating = +movie.rating;
        movie.year = +movie.year;
        return movie;
    });

    // Initial rendering
    renderChart(movies, "year", "rating");

    // Event listeners for metric selection
    d3.select("#x-metric").on("change", () => {
        const xMetric = d3.select("#x-metric").node().value;
        const yMetric = d3.select("#y-metric").node().value;
        renderChart(movies, xMetric, yMetric);
    });

    d3.select("#y-metric").on("change", () => {
        const xMetric = d3.select("#x-metric").node().value;
        const yMetric = d3.select("#y-metric").node().value;
        renderChart(movies, xMetric, yMetric);
    });

    // Render chart function
    function renderChart(movies, xMetric, yMetric) {
        console.log(`Rendering chart with x-axis metric: ${xMetric}, y-axis metric: ${yMetric}`);

        const margin = { top: 20, right: 20, bottom: 50, left: 50 },
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // Remove any existing chart
        d3.select("#chart").html("");

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Set up scales and axis
        const xScale = d3.scaleLinear()
            .domain(d3.extent(movies, d => d[xMetric]))
            .range([0, width])
            .nice();

        const yScale = d3.scaleLinear()
            .domain(d3.extent(movies, d => d[yMetric]))
            .range([height, 0])
            .nice();

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .append("text")
            .attr("class", "axis-label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text(xMetric);

        svg.append("g")
            .call(yAxis)
            .append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(yMetric);

        // Draw scatter plot points
        svg.selectAll(".dot")
            .data(movies)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d[xMetric]))
            .attr("cy", d => yScale(d[yMetric]))
            .attr("r", 2)
            .style("fill", "red");
    }
}).catch(error => {
    console.error('Error loading the data:', error);
});
