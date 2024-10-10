<?php

require_once '../data/usuario.php';
require_once 'utilidades.php';

/**
 * Establecer el encabezado
 * La respuesta va a ser un objeto tipo JSON
 * Indica al  cliente (navegador web o aplicación que realiza  la petición HTTP) que el contenido de la respuesta será en formato JSON
 */

 header('Content-Type: application/json');

 $usuario = new Usuario();
 
 /**
  * La variable superglobal $_SERVER['REQUEST_METHOD'] contiene información sobre el método de solicitud HTTP realizado
  * REQUEST_METHOD :
  * -   GET     Para solicitar datos del servidor
  * -   POST    Para enviar datos al  servidor
  * -   PUT     Para actualizar datos existentes
  * -   DELETE  Para eliminar
  */
//obtener el método de la petición (GET, POST, PUT, DELETE)
  $method = $_SERVER['REQUEST_METHOD'];

  // Obtener la URI de la petición
  $uri = $_SERVER['REQUEST_URI'];

  //obtener los parámetros de la petición
  $parametros = Utilidades::parseUriParameters($uri);

  //obtener el parámetro id
  $id = Utilidades::getParameterValue($parametros, 'id');
  
  switch($method){
    case 'GET':
        if($id){
            $respuesta = getUsuarioById($usuario, $id);
        }else{
            $respuesta = getAllUsuarios($usuario);
        }
        echo json_encode($respuesta);
        break;
    case 'POST':
        setUser($usuario);
        break;
    case 'PUT':
        if($id){
          updateUser($usuario, $id);
        }else{
          http_response_code(400);
          echo json_encode(['error' => 'ID no proporcionado']);
        }
        break;
    case 'DELETE':
        if($id){
          deleteUser($usuario, $id);
        }else{
          http_response_code(400);
          echo json_encode(['error' => 'ID no proporcionado']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
  }

  function getUsuarioById($usuario, $id){
    return $usuario->getById($id);
  }

  function getAllUsuarios($usuario){
    return $usuario->getAll();
  }

  function setUser($usuario){
    $data = json_decode(file_get_contents('php://input'), true);
    if(isset($data['nombre']) && isset($data['email'])){
      $id = $usuario->create($data['nombre'], $data['email']);
      echo json_encode(['id' => $id]);
    }else{
      echo json_encode(['Error' => 'Datos insuficientes']);
    }
  }

  function updateUser($usuario, $id){
    $data = json_decode(file_get_contents('php://input'), true);

    if(isset($data['nombre']) && isset($data['email'])){
      $affected = $usuario->update($id, $data['nombre'], $data['email']);
      echo json_encode(['affected' => $affected]); 
    }else{
      echo json_encode(['Error' => 'Datos insuficientes']);
    }
 
  }

  function deleteUser($usuario, $id)
{
    $affected = $usuario->delete($id);
    echo json_encode(['affected' => $affected]);
}