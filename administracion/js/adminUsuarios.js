const API_URL = 'http://localhost/08-php-api/controllers/usuarios.php';

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
    return email;
}

function validarNombre(nombre){
    return nombre.length >= 2 && nombre.length <= 50;
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
                    <tr data-id="${user.id}" class="view-mode">
                        <td>
                            ${user.id}
                        </td>
                        <td>
                            <span>${sanitizedNombre}</span>
                        </td>
                        <td>
                            <span>${sanitizedEmail}</span>
                        </td>
                        <td>
                            <button onclick="toggleEditMode(${user.id})">Editar</button>
                            <button onclick="deleteUser(${user.id})">Eliminar</button>
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
    const errorElement = document.getElementById('createError');

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
    })
    .catch(error => {
        console.log('Error: ', error);
        errorElement.textContent = 'Error al crear al usuario. Por favor, inténtelo de nuevo';
    })
}

function toggleEditMode(id){
    alert('Modificar Usuario ' + id);
}
function deleteUser(id){
    alert('Eliminar Usuario ' + id);
}

document.getElementById('createForm').addEventListener('submit', createUser);

getUsers();