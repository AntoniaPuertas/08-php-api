<?php

require_once '../data/pelicula.php';
require_once 'utilidades.php';

header('Content-Type: application/json');

$pelicula = new Pelicula();

$method = $_SERVER['REQUEST_METHOD'];

$uri = $_SERVER['REQUEST_URI'];

$parametros = Utilidades::parseUriParameters($uri);

$id = Utilidades::getParameterValue($parametros, 'id');

switch($method){
    case 'GET':
        if($id){
            $respuesta = getPeliculaById($pelicula, $id);
        }else{
            $respuesta = getAllPeliculas($pelicula);
        }
        echo json_encode($respuesta);
        break;
    case 'POST':
        setPelicula($pelicula);
        break;
    case 'PUT':
        if($id){
          updatePelicula($pelicula, $id);
        }else{
          http_response_code(400);
          echo json_encode(['error' => 'ID no proporcionado']);
        }
        break;
    case 'DELETE':
        if($id){
          deletePelicula($pelicula, $id);
        }else{
          http_response_code(400);
          echo json_encode(['error' => 'ID no proporcionado']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
  }

  function getPeliculaById($pelicula, $id){
    return $pelicula->getById($id);
  }

  function getAllPeliculas($pelicula){
    return $pelicula->getAll();
  }

  function setPelicula($pelicula){
    $data = json_decode(file_get_contents('php://input'), true);
    if(isset($data['titulo']) && isset($data['precio']) && isset($data['id_director'])){
      $id = $pelicula->create($data['titulo'], $data['precio'], $data['id_director']);
      echo json_encode(['id' => $id]);
    }else{
      echo json_encode(['Error' => 'Datos insuficientes']);
    }
  }

  function updatePelicula($pelicula, $id){
    $data = json_decode(file_get_contents('php://input'), true);

    if(isset($data['titulo']) && isset($data['precio']) && isset($data['id_director'])){
      $affected = $pelicula->update($id, $data['titulo'], $data['precio'], $data['id_director']);
      echo json_encode(['affected' => $affected]); 
    }else{
      echo json_encode(['Error' => 'Datos insuficientes']);
    }
 
  }

  function deletePelicula($pelicula, $id)
{
    $affected = $pelicula->delete($id);
    echo json_encode(['affected' => $affected]);
}