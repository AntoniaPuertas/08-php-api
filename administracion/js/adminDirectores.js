// const API_URL = 'https://antoniapuertas.com/08-php-api/controllers/directores.php';
const API_URL = '../controllers/directores.php';
const errorElement = document.getElementById('createError');
/**
 * 
 * @param {*} str string
 * @returns string limpio de caracteres html
 * Limpia una cadena de texto convirtiendo ciertos caracteres potencialmente  peligrosos en sus equivalentes html seguros
 * [^...] coincide con cualquier carácter que no esté en el conjunto
 * \w Caracteres de palabra, letras, números, guión bajo
 * . @- Admite punto, espacio, arroba y guión medio
 * /gi Flags para que la búsqueda de caracteres sea global (g) e  insensible  a mayúsculas y minúsculas (i) 
 * 
 * funcion(c){return '&#' + caches.charCodeAt(0) + ';'} crea para cada carácter su código en ASCII con charCodeAt() 
 * devuelve la entidad HTML numérica correspondiente, por ejemplo &#60; para < 
 * Esta función se utiliza para prevenir ataques XSS(Cross-Site-Scripting) 
 */
function limpiarHTML(str){
    return str.replace(/[^\w. @-]/gi, function(e) {
        return '&#' + e.charCodeAt(0) + ';';
    });
}

function esEntero(str) {
    return /^\d+$/.test(str);
}

function validaciones(nombre, apellido, fecha, biografia){
    let errores = [];
    if(nombre.length <= 2 || nombre.length >= 50){
        errores.push('El nombre debe tener entre 2 y 50 caracteres.');
    }
    if(apellido.length <= 2 || apellido.length >= 50){
        errores.push('El apellido debe tener entre 2 y 50 caracteres.');
    }  
    if(isNaN(Date.parse(fecha))){
        errores.push('La fecha no tiene un formato válido.');
    } 
    const hoy = new Date();
    const fechaAComprobar = new Date(fecha);
    if(fechaAComprobar > hoy){
        errores.push('La fecha no puede ser posterior a la actual');
    }
    if(biografia.length > 65500){
        errores.push("La biografía es demasiado extensa, no debe tener más de 65.500 caracteres.");
    }
    return errores;
}


function getDirectores(){
    fetch(API_URL)
        .then(response=> response.json())
        .then(directores => {
            const tableBody = document.querySelector('#directoresTable tbody');
            tableBody.innerHTML = '';
            directores.forEach(director => {
                const sanitizedNombre = limpiarHTML(director.nombre);
                const sanitizedApellido = limpiarHTML(director.apellido);
                const sanitizedFechaNacimiento = limpiarHTML(director.fecha_nacimiento);
                const sanitizedBiografia = limpiarHTML(director.biografia);
                tableBody.innerHTML += `
                    <tr data-id="${director.id}">
                        <td>
                            ${director.id}
                        </td>
                        <td>
                            <span class="listado">${sanitizedNombre}</span>
                            <input class="edicion" type="text" value="${sanitizedNombre}">
                        </td>
                        <td>
                            <span class="listado">${sanitizedApellido}</span>
                            <input class="edicion" type="text" value="${sanitizedApellido}">
                        </td>
                        <td>
                            <span class="listado">${sanitizedFechaNacimiento}</span>
                            <input class="edicion" type="date" value="${sanitizedFechaNacimiento}">
                        </td>
                        <td>
                            <span class="listado">${sanitizedBiografia}</span>
                            <textarea class="edicion">${sanitizedBiografia}</textarea>
                        </td>
                        <td class="td-btn">
                            <button class="listado" onclick="editMode(${director.id})">Editar</button>
                            <button class="listado" onclick="deleteDirector(${director.id})">Eliminar</button>
                            <button class="edicion" onclick="updateDirector(${director.id})">Guardar</button>
                            <button class="edicion" onclick="cancelEdit(${director.id})">Cancelar</button>
                        </td>
                    </tr>
                `
            });

        })
        .catch(error => console.log('Error:', error));
}

function createDirector(event){
    event.preventDefault();
    const nombre = document.getElementById('createNombre').value.trim();
    const apellido = document.getElementById('createApellido').value.trim();
    const fecha_nacimiento = document.getElementById('createFechaNacimiento').value.trim();
    const biografia = document.getElementById('createBiografia').value.trim();

    let erroresValidaciones = validaciones(nombre, apellido, fecha_nacimiento, biografia);

    if(erroresValidaciones.length > 0){
        mostrarErrores(erroresValidaciones);
        return;
    }

    errorElement.innerHTML = '';

    //envio al controlador los datos
    fetch(`${API_URL}?metodo=nuevo`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({nombre, apellido, fecha_nacimiento, biografia})
    })
    .then(response => response.json())
    .then(result => {
        console.log('Director creado: ', result);
        //if(!esEntero(result['id'])){
        if(!parseInt(result['id'])){
            erroresApi = Object.values(result['id']);
            console.log("erroresApi:",  erroresApi);
            mostrarErrores(erroresApi);
        }else{
            getDirectores();
        }
        event.target.reset();
    })
    .catch(error => {
        console.log('Error: ', JSON.stringify(error));
    })
}

function updateDirector(id){
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const newNombre = row.querySelector('td:nth-child(2) input').value.trim();
    const newApellido = row.querySelector('td:nth-child(3) input').value.trim();
    const newFecha = row.querySelector('td:nth-child(4) input').value.trim();
    const newBiografia = row.querySelector('td:nth-child(5) textarea').value.trim();

    let erroresValidaciones = validaciones(newNombre, newApellido, newFecha, newBiografia);
    if(erroresValidaciones.length > 0){
        mostrarErrores(erroresValidaciones);
        return;
    }
    errorElement.innerHTML = '';

    fetch(`${API_URL}?id=${id}&metodo=actualizar`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({nombre: newNombre, apellido: newApellido, fecha_nacimiento: newFecha, biografia: newBiografia})
   }).then(response => response.json())
     .then(result => {
        console.log('Director actualizado', result);
        if(!esEntero(result['affected'])){
            erroresApi = Object.values(result['affected']);
            mostrarErrores(erroresApi);
        }else{
            getDirectores();
        }
     })
     .catch(error => {
        console.log(error);
        alert('Error al actualizar al director. Por favor, inténtelo de nuevo.');
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
function deleteDirector(id){
    if(confirm('¿Estás seguro de que quieres eliminar este director?')){
       fetch(`${API_URL}?id=${id}&metodo=eliminar`, {
            method: 'POST',
       })
       .then(response => response.json())
       .then(result => {
            console.log('director eliminado: ', result);
            getDirectores();
       })
       .catch(error => console.error('Error: ', error));
    }
}

document.getElementById('createForm').addEventListener('submit', createDirector);

getDirectores();