const url = "../controllers/peliculas.php";
// const url = "https://antoniapuertas.com/08-php-api/controllers/peliculas.php";
let contenedor = document.getElementById('container');


function getAllMovies(){
    fetch(url)
    .then(response=> response.json())
    .then(peliculas => {
        peliculas.forEach(pelicula => {
            contenedor.innerHTML += `
                <h2>${pelicula.titulo}</h2>
                <p>${pelicula.precio}</p>
            `
        });
    })
    .catch(error => console.log('Error:', error));
}

getAllMovies();