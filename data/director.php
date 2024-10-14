<?php

require_once 'database.php';
require_once 'validator.php';
require_once 'validatorException.php';

class Director{
    private Database $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    public function getAll(){
        $result = $this->db->query("SELECT id, nombre, apellido, fecha_nacimiento, biografia FROM director;");
        return $result->fetch_all(MYSQLI_ASSOC);    
    }

    public function getById($id){
        $idSaneado = Validator::sanear([$id]);
        $result = $this->db->query("SELECT id, nombre, apellido, fecha_nacimiento,  biografia FROM director WHERE id = ?", [$idSaneado[0]]);
        return $result->fetch_assoc();
    }

    public function create($nombre, $apellido, $fecha_nacimiento = null, $biografia = null){
        $data = ['nombre' => $nombre, 'apellido' => $apellido, 'fecha_nacimiento' => $fecha_nacimiento, 'biografia' => $biografia];
        $dataSaneados = Validator::sanear($data);
        $errors = Validator::validarDirector($dataSaneados);

        if(!empty($errors)){
            $errores = new ValidatorException($errors);
            return $errores->getErrors();
        }

        $nombreSaneado = $dataSaneados['nombre'];
        $apellidoSaneado = $dataSaneados['apellido'];
        $fNacimientoSaneado = $dataSaneados['fecha_nacimiento'];
        $biografiaSaneado = $dataSaneados['biografia'];

        //lanzamos la consulta
        $this->db->query("INSERT INTO director (nombre, apellido, fecha_nacimiento, biografia) VALUES(?, ?, ?, ?)", [$nombreSaneado, $apellidoSaneado, $fNacimientoSaneado, $biografiaSaneado]);

        return $this->db->query("SELECT LAST_INSERT_ID() as id")->fetch_assoc()['id'];
    }

    public function update($id, $nombre, $apellido, $fecha_nacimiento = null, $biografia = null){
        $data = ['id' => $id, 'nombre' => $nombre, 'apellido' => $apellido, 'fecha_nacimiento' => $fecha_nacimiento, 'biografia' => $biografia];
        $dataSaneados = Validator::sanear($data);
        $errors = Validator::validarDirector($dataSaneados);

        if(!empty($errors)){
            $errores = new ValidatorException($errors);
            return $errores->getErrors();
        }
        $nombreSaneado = $dataSaneados['nombre'];
        $apellidoSaneado = $dataSaneados['apellido'];
        $fNacimientoSaneado = $dataSaneados['fecha_nacimiento'];
        $biografiaSaneado = $dataSaneados['biografia'];
        $idSaneado = $dataSaneados['id'];


        $this->db->query("UPDATE director SET nombre = ?, apellido = ?, fecha_nacimiento = ?, biografia = ? WHERE id = ?", [$nombreSaneado, $apellidoSaneado, $fNacimientoSaneado, $biografiaSaneado, $idSaneado]);
        return $this->db->query("SELECT ROW_COUNT() as affected")->fetch_assoc()['affected'];
    }

    public function delete($id){
        $idSaneado = Validator::sanear([$id]);
        $this->db->query("DELETE FROM director WHERE id = ?", [$idSaneado[0]]);
        return $this->db->query("SELECT ROW_COUNT() as affected")->fetch_assoc()['affected'];
    }
}