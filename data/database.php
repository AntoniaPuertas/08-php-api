<?php
require_once 'config.php';

class Database{

    private $conn;

    public function __construct(){
        $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if($this->conn->connect_error){
            die("Error de conexión: " . $this->conn->connect_error);
        }
    }

    public function query($sql, $params = []){
        //prepara la consulta
        $estamento = $this->conn->prepare($sql);
        if($estamento === false){
            die("Error en la preparación: " . $this->conn->error);
        } 

        if(!empty($params)){
            //count($params) cuenta los parámetros que hay en el array
            //str_repeat('s', count($params)) crea una cadena con tantas 's' como parámetros hay
            //'s' indica que todos los parámetros serán tratados como strings
            $types = str_repeat('s', count($params));
            //añade los parámetros a la consulta
            //$types es la cadena de  tipos que acabamos de crear
            //...$params es el operador de expansión que desempaqueta el array $params en argumentos individuales
            $estamento->bind_param($types, ...$params);
        }
        //ejecuta la consulta
        $estamento->execute();
        
        return $estamento->get_result();
    }

    public function close(){
        $this->conn->close();
    }

}

