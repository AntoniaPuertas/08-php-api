<?php

class Utilidades{

    /**
     * Recibe una url y devuelve un array asociativo con los parámetros que haya en la url
     * Si no hay parámetros devuelve un array vacío
     */
    public static function parseUriParameters($uri) {
        
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
        
        return $params;
    }

    public static function getParameterValue(array $params, string $paramName) {

        // if(isset($params[$paramName])){
        //     return $params[$paramName];
        // }else{
        //     return null;
        // }

        return $params[$paramName] ?? null;
    }
}