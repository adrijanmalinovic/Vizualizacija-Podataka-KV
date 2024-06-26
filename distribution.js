/* distribution.js */
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

    // Get all unique genres
    let genres = new Set();
    movies.forEach(movie => {
        movie.genres.forEach(genre => genres.add(genre));
    });

    // Populate genre filter
    const genreFilter = d3.select("#genre");
    genres.forEach(genre => {
        genreFilter.append("option").attr("value", genre).text(genre);
    });

    // Initial rendering
    renderChart(movies, "year", "");

    // Event listeners for metric and genre selection
    d3.select("#metric").on("change", () => {
        const metric = d3.select("#metric").node().value;
        const genre = d3.select("#genre").node().value;
        renderChart(movies, metric, genre);
    });

    d3.select("#genre").on("change", () => {
        const metric = d3.select("#metric").node().value;
        const genre = d3.select("#genre").node().value;
        renderChart(movies, metric, genre);
    });

    // Render chart function
    function renderChart(movies, metric, genre) {
        console.log(`Rendering chart with metric: ${metric}, genre: ${genre}`);
        let filteredMovies = movies;
        if (genre) {
            filteredMovies = movies.filter(movie => movie.genres.includes(genre));
        }

        const values = filteredMovies.map(movie => movie[metric]);

        // Set up chart dimensions
        const margin = { top: 20, right: 30, bottom: 60, left: 60 },
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
        const x = d3.scaleLinear()
            .domain(d3.extent(values))
            .nice()
            .range([0, width]);

        const histogram = d3.histogram()
            .value(d => d)
            .domain(x.domain())
            .thresholds(x.ticks(20));

        const bins = histogram(values);

        const y = d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length)])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(8).tickSizeOuter(0));

        // Add X axis label
        svg.append("text")
            .attr("class", "x-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .text(metric.charAt(0).toUpperCase() + metric.slice(1));

        // Add Y axis label
        svg.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -height / 2)
            .text("Count");

        // Tooltip setup
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "solid 1px #ccc")
            .style("padding", "10px")
            .style("border-radius", "5px");

        // Draw bars
        svg.selectAll("rect")
            .data(bins)
            .enter().append("rect")
            .attr("x", 1)
            .attr("transform", d => `translate(${x(d.x0)},${y(d.length)})`)
            .attr("width", d => x(d.x1) - x(d.x0) - 1)
            .attr("height", d => height - y(d.length))
            .style("fill", "#69b3a2")
            .on("mouseover", (event, d) => {
                const metricLabel = metric.charAt(0).toUpperCase() + metric.slice(1);
                tooltip.style("visibility", "visible")
                    .html(`<strong>Count:</strong><br>${d.length}<br><br><strong>${metricLabel}:</strong><br>${d.x0} - ${d.x1}`);
            })
            .on("mousemove", event => {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            });
    }
}).catch(error => {
    console.error('Error loading the data:', error);
});