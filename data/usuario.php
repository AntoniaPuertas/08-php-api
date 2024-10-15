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
            return $errors;
        }

        $nombreSaneado = $dataSaneados['nombre'];
        $emailSaneado = $dataSaneados['email'];

        // Verificar si el email ya existe
        $result = $this->db->query("SELECT id FROM usuario WHERE email = ?", [$emailSaneado]);
        if ($result->num_rows > 0) {
            return ["email" => "El email ya existe"];
        }

        //lanzamos la consulta
        $this->db->query("INSERT INTO usuario (nombre, email) VALUES(?, ?)", [$nombreSaneado, $emailSaneado]);

        return $this->db->query("SELECT LAST_INSERT_ID() as id")->fetch_assoc()['id'];
    }

    public function update($id, $nombre, $email){
        $data = ['id' => $id, 'nombre' => $nombre, 'email' => $email];
        $dataSaneados = Validator::sanear($data);
        $errors = Validator::validar($dataSaneados);

        if(!empty($errors)){
            return $errors;
        }
        $nombreSaneado = $dataSaneados['nombre'];
        $emailSaneado = $dataSaneados['email'];
        $idSaneado = $dataSaneados['id'];


         // Verificar si el nuevo email ya existe para otro usuario
        $result = $this->db->query("SELECT id FROM usuario WHERE email = ? AND id != ?", [$emailSaneado, $idSaneado]);

        if ($result->num_rows > 0) {
            return ["email" => "El email ya está en uso por otro usuario"];
        }

        $this->db->query("UPDATE usuario SET nombre = ?, email = ? WHERE id = ?", [$nombreSaneado, $emailSaneado, $idSaneado]);
        return $this->db->query("SELECT ROW_COUNT() as affected")->fetch_assoc()['affected'];
    }

    public function delete($id){
        $idSaneado = Validator::sanear([$id]);
        $this->db->query("DELETE FROM usuario WHERE id = ?", [$idSaneado[0]]);
        return $this->db->query("SELECT ROW_COUNT() as affected")->fetch_assoc()['affected'];
    }
}