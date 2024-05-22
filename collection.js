d3.json("movies.json").then(data => {
    console.log("Data loaded:", data);
    
    let movies = data.map(movie => {
        movie.rank = +movie.rank;
        movie.duration = +movie.duration;
        movie.votes = +movie.votes;
        movie.rating = +movie.rating;
        movie.year = +movie.year; // Parse year as a number
        return movie;
    });

    // Check if movies data is correctly processed
    console.log("Processed movies:", movies);

    // Get all unique genres
    let genres = new Set();
    movies.forEach(movie => {
        movie.genres.forEach(genre => genres.add(genre));
    });

    // Populate genre filter
    const genreFilter = d3.select("#filter-genre");
    genres.forEach(genre => {
        genreFilter.append("option").attr("value", genre).text(genre);
    });

    // Initial rendering
    renderGrid(movies);

    // Event listeners for sorting and filtering
    d3.select("#sort-by").on("change", () => {
        const sortedMovies = sortMovies(filterMovies(movies));
        console.log("Sorted movies:", sortedMovies);
        renderGrid(sortedMovies);
    });

    d3.select("#filter-genre").on("change", () => {
        const filteredMovies = filterMovies(movies);
        console.log("Filtered movies:", filteredMovies);
        renderGrid(filteredMovies);
    });

    // Sorting function
    function sortMovies(movies) {
        const sortBy = d3.select("#sort-by").node().value;
        const [key, order] = sortBy.split("-");
        return movies.slice().sort((a, b) => {
            if (order === "asc") {
                return a[key] - b[key];
            } else {
                return b[key] - a[key];
            }
        });
    }

    // Filtering function
    function filterMovies(movies) {
        const selectedGenre = d3.select("#filter-genre").node().value;
        return selectedGenre === "" ? movies : movies.filter(movie => movie.genres.includes(selectedGenre));
    }

    // Render grid function
    function renderGrid(movies) {
        console.log("Rendering grid with movies:", movies);
        const grid = d3.select("#movie-grid").html("");
        movies.forEach(movie => {
            const movieDiv = grid.append("div").attr("class", "movie");
            movieDiv.append("img").attr("src", movie.image).attr("alt", movie.title);
            movieDiv.append("div").attr("class", "movie-title").text(movie.title);
            const movieInfo = movieDiv.append("div").attr("class", "movie-info");
            movieInfo.html(`
                <p><strong>Rank:</strong> ${movie.rank}</p>
                <p><strong>Rating:</strong> ${movie.rating}</p>
                <p><strong>Votes:</strong> ${movie.votes}</p>
                <p><strong>Duration:</strong> ${movie.duration} minutes</p>
                <p><strong>Year:</strong> ${movie.year}</p>
            `);
        });
    }
}).catch(error => {
    console.error('Error loading the data:', error);
});