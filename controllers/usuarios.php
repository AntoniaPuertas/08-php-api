<?php

require_once '../data/usuario.php';

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

  $method = $_SERVER['REQUEST_METHOD'];
  //todo mejorar este código (es un poco chapuza)
$id = null;
if(isset(explode('=', $_SERVER['REQUEST_URI'])[1])){
  $request = explode('=', $_SERVER['REQUEST_URI'])[1];
  $id = isset($request[0]) && is_numeric($request[0]) ? intval($request[0]) : null;
}


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
    $id = $usuario->create($data['nombre'], $data['email']);
    echo json_encode(['id' => $id]);
  }

  function updateUser($usuario, $id){

  }

  function deleteUser($usuario, $id)
{

}