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
        const margin = { top: 20, right: 20, bottom: 60, left: 90 },
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

        const xAxis = d3.axisBottom(xScale).ticks(8).tickSizeOuter(0);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

        // Add X axis label
        svg.append("text")
            .attr("class", "x-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .text(xMetric.charAt(0).toUpperCase() + xMetric.slice(1));

        // Add Y axis label
        svg.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -height / 2)
            .text(yMetric.charAt(0).toUpperCase() + yMetric.slice(1));

        // Tooltip setup
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "solid 1px #ccc")
            .style("padding", "10px")
            .style("border-radius", "5px");

        // Create a map to store movies at each position
        const positionMap = new Map();

        movies.forEach(movie => {
            const key = `${xScale(movie[xMetric])},${yScale(movie[yMetric])}`;
            if (!positionMap.has(key)) {
                positionMap.set(key, []);
            }
            positionMap.get(key).push(movie);
        });

        // Draw scatter plot points
        svg.selectAll(".dot")
            .data(Array.from(positionMap.entries()))
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => d[0].split(',')[0])
            .attr("cy", d => d[0].split(',')[1])
            .attr("r", d => Math.min(5, 2 + d[1].length)) // Increase size for overlapping points
            .style("fill", "red")
            .on("mouseover", (event, d) => {
                const moviesAtPoint = d[1];
                let tooltipContent = moviesAtPoint.map(movie => 
                    `<strong>${movie.title}</strong><br>` +
                    `<em>${xMetric}</em> - ${movie[xMetric]}<br>` +
                    `<em>${yMetric}</em> - ${movie[yMetric]}`
                ).join('<br><br>');
                
                tooltip.style("visibility", "visible")
                    .html(tooltipContent);
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