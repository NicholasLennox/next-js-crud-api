// Program.cs
// Minimal API - in-memory movie data
// Auth middleware is stubbed out, ready to enable Friday

using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var movies = new List<Movie>
{
    new Movie { Id = 1, Title = "Inception", Genre = "Sci-Fi", Year = 2010, Description = "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea." },
    new Movie { Id = 2, Title = "The Dark Knight", Genre = "Action", Year = 2008, Description = "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests." },
    new Movie { Id = 3, Title = "Interstellar", Genre = "Sci-Fi", Year = 2014, Description = "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
    new Movie { Id = 4, Title = "The Godfather", Genre = "Crime", Year = 1972, Description = "The aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son." },
    new Movie { Id = 5, Title = "Pulp Fiction", Genre = "Crime", Year = 1994, Description = "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption." },
    new Movie { Id = 6, Title = "Parasite", Genre = "Thriller", Year = 2019, Description = "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan." },
    new Movie { Id = 7, Title = "The Grand Budapest Hotel", Genre = "Comedy", Year = 2014, Description = "A writer encounters the owner of an ageing hotel who tells him of his early years as a lobby boy." },
    new Movie { Id = 8, Title = "Spirited Away", Genre = "Animation", Year = 2001, Description = "A sullen ten-year-old girl wanders into a world ruled by gods, witches and monsters, where humans are changed into beasts." },
    new Movie { Id = 9, Title = "No Country for Old Men", Genre = "Thriller", Year = 2007, Description = "Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and more than two million dollars in cash near the Rio Grande." },
    new Movie { Id = 10, Title = "Eternal Sunshine of the Spotless Mind", Genre = "Romance", Year = 2004, Description = "When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories." },
    new Movie { Id = 11, Title = "Everything Everywhere All at Once", Genre = "Sci-Fi", Year = 2022, Description = "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes." },
    new Movie { Id = 12, Title = "The Shining", Genre = "Horror", Year = 1980, Description = "A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence." },
};

int nextId = movies.Count + 1;

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();

// --- stub: drop JWT middleware here Friday ---
// app.UseAuthentication();
// app.UseAuthorization();

// Public endpoints
app.MapGet("/api/movies", () => Results.Ok(movies));

app.MapGet("/api/movies/{id}", (int id) =>
{
    var movie = movies.FirstOrDefault(m => m.Id == id);
    return movie is null ? Results.NotFound() : Results.Ok(movie);
});

// Protected endpoints - Friday you add [Authorize] and uncomment middleware
app.MapPost("/api/movies", ([FromBody] MovieRequest request) =>
{
    var movie = new Movie
    {
        Id = nextId++,
        Title = request.Title,
        Genre = request.Genre,
        Year = request.Year,
        Description = request.Description
    };
    movies.Add(movie);
    return Results.Created($"/api/movies/{movie.Id}", movie);
});

app.MapPut("/api/movies/{id}", (int id, [FromBody] MovieRequest request) =>
{
    var movie = movies.FirstOrDefault(m => m.Id == id);
    if (movie is null) return Results.NotFound();

    movie.Title = request.Title;
    movie.Genre = request.Genre;
    movie.Year = request.Year;
    movie.Description = request.Description;

    return Results.Ok(movie);
});

app.MapDelete("/api/movies/{id}", (int id) =>
{
    var movie = movies.FirstOrDefault(m => m.Id == id);
    if (movie is null) return Results.NotFound();

    movies.Remove(movie);
    return Results.NoContent();
});

// Auth stub - Friday
app.MapPost("/api/login", ([FromBody] LoginRequest request) =>
{
    // swap this out for real validation Friday
    if (request.Username == "admin" && request.Password == "password")
    {
        return Results.Ok(new { token = "stub-token" });
    }
    return Results.Unauthorized();
});

app.Run();

// Models
record Movie
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Description { get; set; } = string.Empty;
}

record MovieRequest(string Title, string Genre, int Year, string Description);
record LoginRequest(string Username, string Password);