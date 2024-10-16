const API_URL_PELICULAS = 'http://localhost/08-php-api/controllers/peliculas.php';
const API_URL_DIRECTORES = 'http://localhost/08-php-api/controllers/directores.php';
const errorElement = document.getElementById('createError');
let listaDirectores = [];

function limpiarHTML(str){
    return str.replace(/[^\w. @-]/gi, function(e) {
        return '&#' + e.charCodeAt(0) + ';';
    });
}

function esEntero(str) {
    return /^\d+$/.test(str);
}

function validaciones(titulo, precio, id_director){
    let errores = [];
    if(titulo.length <= 2 || titulo.length >= 50){
        errores.push('El titulo debe tener entre 2 y 50 caracteres.');
    }
    if(!parseFloat(precio) || precio < 0){
        errores.push('El precio tiene que ser un número válido positivo');
    }
    if(!parseInt(id_director)){
        errores.push('El director elegido no es válido');
    }
    return errores;
}

function mostrarSelectDirector(listaDirectores, selectDirector){
    selectDirector.innerHTML = '';
    listaDirectores.forEach(director => {
        const sanitizedNombre = limpiarHTML(director.nombre);
        const sanitizedApellido = limpiarHTML(director.apellido);
        selectDirector.innerHTML += `
            <option value="${director.id}">${sanitizedNombre} ${sanitizedApellido}</option>
        `
    });
}

function getDirectores(){
    fetch(API_URL_DIRECTORES)
        .then(response=> response.json())
        .then(directores => {
            listaDirectores = directores;
            getPeliculas();
            const selectDirector = document.querySelector('#seleccionaDirector');
            mostrarSelectDirector(listaDirectores, selectDirector);
        })
        .catch(error => console.log('Error:', error));
}

function getPeliculas(){
    fetch(API_URL_PELICULAS)
        .then(response=> response.json())
        .then(peliculas => {
            const tableBody = document.querySelector('#peliculasTable tbody');
            tableBody.innerHTML = '';
            peliculas.forEach(pelicula => {
                const sanitizedTitulo = limpiarHTML(pelicula.titulo);
                const sanitizedPrecio = limpiarHTML(pelicula.precio);
                const directorSeleccionado = listaDirectores.find(director => director.id === pelicula.id_director);
                let optionsHTML = '';
                listaDirectores.forEach(director => {
                    const sanitizedNombre = limpiarHTML(director.nombre);
                    const sanitizedApellido = limpiarHTML(director.apellido);
                    optionsHTML += `
                        <option 
                            value="${director.id}" 
                            ${(director.id === directorSeleccionado.id)? 'selected' : ''}>
                            ${sanitizedNombre} ${sanitizedApellido}
                        </option>
                    `
                })
                
                tableBody.innerHTML += `
                    <tr data-id="${pelicula.id}">
                        <td>
                            ${pelicula.id}
                        </td>
                        <td>
                            <span class="listado">${sanitizedTitulo}</span>
                            <input class="edicion" type="text" value="${sanitizedTitulo}">
                        </td>
                        <td>
                            <span class="listado">${sanitizedPrecio}</span>
                            <input class="edicion" type="number" value="${sanitizedPrecio}">
                        </td>
                        <td>
                            <span class="listado">${directorSeleccionado.nombre} ${directorSeleccionado.apellido}</span>
                            <select class="edicion">${optionsHTML}</select>
                        </td>
                        <td class="td-btn">
                            <button class="listado" onclick="editMode(${pelicula.id})">Editar</button>
                            <button class="listado" onclick="deletePelicula(${pelicula.id})">Eliminar</button>
                            <button class="edicion" onclick="updatePelicula(${pelicula.id})">Guardar</button>
                            <button class="edicion" onclick="cancelEdit(${pelicula.id})">Cancelar</button>
                        </td>
                    </tr>
                `
            });

        })
        .catch(error => console.log('Error:', error));
}

function createPelicula(event){
    event.preventDefault();
    const titulo = document.getElementById('createTitulo').value.trim();
    const precio = document.getElementById('createPrecio').value.trim();
    const id_director = document.getElementById('seleccionaDirector').value.trim();

    let erroresValidaciones = validaciones(titulo, precio, id_director);
    console.log('erroresValidaciones ', erroresValidaciones.length);
    if(erroresValidaciones.length > 0){
        mostrarErrores(erroresValidaciones);
        return;
    }

    errorElement.innerHTML = '';

    //envio al controlador los datos
    fetch(API_URL_PELICULAS, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({titulo, precio, id_director})
    })
    .then(response => response.json())
    .then(result => {
        console.log('Película creada: ', result);
        //if(!esEntero(result['id'])){
        if(!parseInt(result['id'])){
            erroresApi = Object.values(result['id']);
            console.log("erroresApi:",  erroresApi);
            mostrarErrores(erroresApi);
        }else{
            getPeliculas();
        }
        event.target.reset();
    })
    .catch(error => {
        console.log('Error: ', JSON.stringify(error));
    })
}

function updatePelicula(id){
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const newTitulo = row.querySelector('td:nth-child(2) input').value.trim();
    const newPrecio = row.querySelector('td:nth-child(3) input').value.trim();
    const newIdDirector = row.querySelector('td:nth-child(4) select').value.trim();


    let erroresValidaciones = validaciones(newTitulo, newPrecio, newIdDirector);
    if(erroresValidaciones.length > 0){
        mostrarErrores(erroresValidaciones);
        return;
    }
    errorElement.innerHTML = '';

    fetch(`${API_URL_PELICULAS}?id=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({titulo: newTitulo, precio: newPrecio, id_director: newIdDirector})
   }).then(response => response.json())
     .then(result => {
        console.log('Película actualizada', result);
        if(!esEntero(result['affected'])){
            erroresApi = Object.values(result['affected']);
            mostrarErrores(erroresApi);
        }else{
            getPeliculas();
        }
     })
     .catch(error => {
        console.log(error);
        alert('Error al actualizar la película. Por favor, inténtelo de nuevo.');
     });
}

function mostrarErrores(errores){
    errorElement.innerHTML = '<ul>';
    errores.forEach(error => {
        return errorElement.innerHTML += `<li>${error}</li>`;
    });
    errorElement.innerHTML += '</ul>';
}

function editMode(id){
    errorElement.innerHTML = '';
    const row = document.querySelector(`tr[data-id="${id}"]`);
    row.querySelectorAll('.edicion').forEach(ro => {
        ro.style.display = 'inline-block';
    })
    row.querySelectorAll('.listado').forEach(ro => {
        ro.style.display = 'none';
    })
}
function cancelEdit(id){
    errorElement.innerHTML = '';
    const row = document.querySelector(`tr[data-id="${id}"]`);
    row.querySelectorAll('.edicion').forEach(ro => {
        ro.style.display = 'none';
    })
    row.querySelectorAll('.listado').forEach(ro => {
        ro.style.display = 'inline-block';
    })
}
function deletePelicula(id){
    if(confirm('¿Estás seguro de que quieres eliminar esta película?')){
       fetch(`${API_URL_PELICULAS}?id=${id}`, {
            method: 'DELETE',
       })
       .then(response => response.json())
       .then(result => {
            console.log('película eliminada: ', result);
            getPeliculas();
       })
       .catch(error => console.error('Error: ', error));
    }
}

document.getElementById('createForm').addEventListener('submit', createPelicula);

document.addEventListener('DOMContentLoaded', getDirectores);
