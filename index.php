<?php

function parseUriParameters($uri) {
        
    // Separar la ruta de los parámetros
    $parts = explode('?', $uri);
    
    // Si no hay parámetros, devolver un array vacío
    if (count($parts) == 1) {
        return [];
    }
    
    // Obtener la cadena de parámetros
    $paramString = $parts[1];
    
    // Dividir los parámetros
    $paramPairs = explode('&', $paramString);

    // Array para almacenar los parámetros
    $params = [];
    
    // Procesar cada par de parámetros
    foreach ($paramPairs as $pair) {
        $item = explode('=', $pair);
        if (count($item) == 2) {
            $key = urldecode($item[0]);
            $value = urldecode($item[1]);
            $params[$key] = $value;
        }
    }
    echo '<pre>';
    var_dump($params);
    echo '</pre>';
    return $params;
}

function getParameterValue(array $params, string $paramName) {
    if(isset($params[$paramName])){
        return $params[$paramName];
    }else{
        return null;
    }
    return $params[$paramName] ?? null;
}

$uri1 = 'https://ejemplo.com';
$uri2 = 'https://ejemplo.com?id=3';
$uri3 = 'https://ejemplo.com?id=3&nombre=pepe&edad=22';

$parametros = parseUriParameters($uri3);

$id = getParameterValue($parametros, 'ciudad');
echo $id;
