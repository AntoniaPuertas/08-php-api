<?php

require_once 'database.php';
require_once 'validator.php';
require_once 'validatorException.php';

class Usuario{
    private Database $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    public function getAll(){
        $result = $this->db->query("SELECT id, nombre, email FROM usuario;");
        return $result->fetch_all(MYSQLI_ASSOC);    
    }

    public function getById($id){
        $idSaneado = Validator::sanear([$id]);
        $result = $this->db->query("SELECT id, nombre, email FROM usuario WHERE id = ?", [$idSaneado[0]]);
        return $result->fetch_assoc();
    }

    public function create($nombre, $email){
        $data = ['nombre' => $nombre, 'email' => $email];
        $dataSaneados = Validator::sanear($data);
        $errors = Validator::validar($dataSaneados);

        if(!empty($errors)){
            $errores = new ValidatorException($errors);
            return $errores->getErrors();
        }
        $nombreSaneado = $dataSaneados['nombre'];
        $emailSaneado = $dataSaneados['email'];
        //lanzamos la consulta
        $this->db->query("INSERT INTO usuario (nombre, email) VALUES(?, ?)", [$nombreSaneado, $emailSaneado]);

        return $this->db->query("SELECT LAST_INSERT_ID() as id")->fetch_assoc()['id'];
    }

    public function update($id, $nombre, $email){
        $idSaneado = Validator::sanear([$id]);
        $data = ['nombre' => $nombre, 'email' => $email];
        $dataSaneados = Validator::sanear($data);
        $errors = Validator::validar($dataSaneados);

        if(!empty($errors)){
            $errores = new ValidatorException($errors);
            return $errores->getErrors();
        }
        $nombreSaneado = $dataSaneados['nombre'];
        $emailSaneado = $dataSaneados['email'];
        $this->db->query("UPDATE usuario SET nombre = ?, email = ? WHERE id = ?", [$nombreSaneado, $emailSaneado, $idSaneado[0]]);
        return $this->db->query("SELECT ROW_COUNT() as affected")->fetch_assoc()['affected'];
    }

    public function delete($id){
        $idSaneado = Validator::sanear([$id]);
        $this->db->query("DELETE FROM usuario WHERE id = ?", [$idSaneado]);
        return $this->db->query("SELECT ROW_COUNT() as affected")->fetch_assoc()['affected'];
    }
}