const API_URL = 'http://localhost/08-php-api/controllers/usuarios.php';
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

function validarEmail(email){
    //todo buscar expresión regular para validar email
    return email;
}

function validarNombre(nombre){
    return nombre.length >= 2 && nombre.length <= 50;
}

function esEntero(str) {
    return /^\d+$/.test(str);
}

function getUsers(){
    fetch(API_URL)
        .then(response=> response.json())
        .then(users => {
            const tableBody = document.querySelector('#usersTable tbody');
            tableBody.innerHTML = '';
            users.forEach(user => {
                const sanitizedNombre = limpiarHTML(user.nombre);
                const sanitizedEmail = limpiarHTML(user.email);
                tableBody.innerHTML += `
                    <tr data-id="${user.id}">
                        <td>
                            ${user.id}
                        </td>
                        <td>
                            <span class="listado">${sanitizedNombre}</span>
                            <input class="edicion" type="text" value="${sanitizedNombre}">
                        </td>
                        <td>
                            <span class="listado">${sanitizedEmail}</span>
                            <input class="edicion" type="email" value="${sanitizedEmail}">
                        </td>
                        <td class="td-btn">
                            <button class="listado" onclick="editMode(${user.id})">Editar</button>
                            <button class="listado" onclick="deleteUser(${user.id})">Eliminar</button>
                            <button class="edicion" onclick="updateUser(${user.id})">Guardar</button>
                            <button class="edicion" onclick="cancelEdit(${user.id})">Cancelar</button>
                        </td>
                    </tr>
                `
            });

        })
        .catch(error => console.log('Error:', error));
}

function createUser(event){
    event.preventDefault();
    const nombre = document.getElementById('createNombre').value.trim();
    const email = document.getElementById('createEmail').value.trim();

    if(!validarNombre(nombre)){
        errorElement.textContent = 'El nombre debe tener entre 2 y 50 caracteres.';
        return;
    }
    if(!validarEmail(email)){
        errorElement.textContent = 'El email no es válido.';
        return;
    }

    errorElement.textContent = '';

    //envio al controlador los datos
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({nombre, email})
    })
    .then(response => response.json())
    .then(result => {
        console.log('Usuario creado: ', result);
        if(!esEntero(result['id'])){
            mostrarErrores(result['id']);
        }else{
            getUsers();
        }
        event.target.reset();
    })
    .catch(error => {
        console.log('Error: ', JSON.stringify(error));
    })
}

function updateUser(id){
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const newNombre = row.querySelector('td:nth-child(2) input').value.trim();
    const newEmail = row.querySelector('td:nth-child(3) input').value.trim();
    
    if(!validarNombre(newNombre)){
        alert("El nombre debe tener entre 2 y 50 caracteres.");
        return;
    }

    if(!validarEmail(newEmail)){
        alert('El email no es válido.');
        return;
    }

    fetch(`${API_URL}?id=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({nombre: newNombre, email: newEmail})
   }).then(response => response.json())
     .then(result => {
        console.log('Usuario actualizado', result);
        if(!esEntero(result['affected'])){
            mostrarErrores(result['affected']);
        }else{
            getUsers();
        }
     })
     .catch(error => {
        alert('Error al actualizar al usuario. Por favor, inténtelo de nuevo.');
     });
}

function mostrarErrores(errores){
    arrayErrores = Object.values(errores);
    errorElement.innerHTML = '<ul>';
    arrayErrores.forEach(error => {
        return errorElement.innerHTML += `<li>${error}</li>`;
    });
    errorElement.innerHTML += '</ul>';
}

function editMode(id){
    const row = document.querySelector(`tr[data-id="${id}"]`);
    row.querySelectorAll('.edicion').forEach(ro => {
        ro.style.display = 'inline-block';
    })
    row.querySelectorAll('.listado').forEach(ro => {
        ro.style.display = 'none';
    })
}
function cancelEdit(id){
    const row = document.querySelector(`tr[data-id="${id}"]`);
    row.querySelectorAll('.edicion').forEach(ro => {
        ro.style.display = 'none';
    })
    row.querySelectorAll('.listado').forEach(ro => {
        ro.style.display = 'inline-block';
    })
}
function deleteUser(id){
    if(confirm('¿Estás seguro de que quieres eliminar este usuario?')){
       fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE',
       })
       .then(response => response.json())
       .then(result => {
            console.log('Usuario eliminado: ', result);
            getUsers();
       })
       .catch(error => console.error('Error: ', error));
    }
}

document.getElementById('createForm').addEventListener('submit', createUser);

getUsers();