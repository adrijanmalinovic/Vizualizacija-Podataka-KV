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

    function getTopDirectors(movies, count) {
        const directorStats = {};
        movies.forEach(movie => {
            movie.directors.forEach(director => {
                if (!directorStats[director]) {
                    directorStats[director] = { totalRating: 0, movieCount: 0, movies: [] };
                }
                directorStats[director].totalRating += movie.rating;
                directorStats[director].movieCount += 1;
                directorStats[director].movies.push(movie);
            });
        });

        const topDirectors = Object.entries(directorStats)
            .map(([name, stats]) => ({
                name,
                averageRating: stats.totalRating / stats.movieCount,
                movieCount: stats.movieCount,
                movies: stats.movies
            }))
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, count);

        return topDirectors;
    }

    function renderChart(topDirectors) {
        const margin = { top: 20, right: 30, bottom: 40, left: 150 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        d3.select("#chart").html("");

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Calculate the minimum average rating
        const minRating = d3.min(topDirectors, d => d.averageRating);
        // Set the x-axis domain to start slightly below the minimum rating
        const xDomainStart = Math.max(0, minRating - 0.01);

        const x = d3.scaleLinear()
            .domain([xDomainStart, d3.max(topDirectors, d => d.averageRating)])
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(topDirectors.map(d => d.name))
            .range([0, height])
            .padding(0.1);

        // Tooltip setup
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "solid 1px #ccc")
            .style("padding", "10px")
            .style("border-radius", "5px");

        svg.selectAll(".bar")
            .data(topDirectors)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", xDomainStart)
            .attr("y", d => y(d.name))
            .attr("width", d => x(d.averageRating) - x(xDomainStart))
            .attr("height", y.bandwidth())
            .attr("fill", "#69b3a2")
            .on("click", (event, d) => displayDirectorMovies(d))
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .html(`<strong>${d.name}</strong><br>Avg. Rating: ${d.averageRating.toFixed(4)}`);
            })
            .on("mousemove", event => {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            });
            

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom)
            .attr("text-anchor", "middle")
            .text("Average Rating");
    }

    function displayDirectorMovies(director) {
        const movieList = d3.select("#director-movies");
        movieList.html("");
        movieList.append("h2").text(`Movies directed by ${director.name}`);
        const list = movieList.append("ul");
        director.movies.forEach(movie => {
            list.append("li").text(`${movie.title} (${movie.year}) - Rating: ${movie.rating}`);
        });
    }

    function updateChart() {
        const count = +d3.select("#director-count").property("value");
        const topDirectors = getTopDirectors(movies, count);
        renderChart(topDirectors);
    }

    d3.select("#update-chart").on("click", updateChart);

    // Initial rendering
    updateChart();
}).catch(error => {
    console.error('Error loading the data:', error);
});