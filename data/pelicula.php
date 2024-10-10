<?php

require_once 'database.php';
require_once 'validator.php';
require_once 'validatorException.php';

class Pelicula{
    private Database $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    public function getAll(){
        $result = $this->db->query("SELECT id, titulo, precio, id_director FROM pelicula;");
        return $result->fetch_all(MYSQLI_ASSOC);    
    }

    public function getById($id){
        $idSaneado = Validator::sanear([$id]);
        $result = $this->db->query("SELECT id, titulo, precio, id_director FROM pelicula WHERE id = ?", [$idSaneado[0]]);
        return $result->fetch_assoc();
    }

    public function create($titulo, $precio, $id_director){
        $data = ['titulo' => $titulo, 'precio' => $precio, 'id_director' => $id_director];
        $dataSaneados = Validator::sanear($data);
        $errors = Validator::validarPelicula($dataSaneados);

        if(!empty($errors)){
            $errores = new ValidatorException($errors);
            return $errores->getErrors();
        }

        $tituloSaneado = $dataSaneados['titulo'];
        $precioSaneado = $dataSaneados['precio'];
        $id_directorSaneado = $dataSaneados['id_director'];

        // Verificar si el id_director existe
        $result = $this->db->query("SELECT id FROM director WHERE id = ?", [$id_directorSaneado]);
        if ($result->num_rows == 0) {
            return "El director no existe";
        }

        //lanzamos la consulta
        $this->db->query("INSERT INTO pelicula (titulo, precio, id_director) VALUES(?, ?, ?)", [$tituloSaneado, $precioSaneado, $id_directorSaneado]);

        return $this->db->query("SELECT LAST_INSERT_ID() as id")->fetch_assoc()['id'];
    }

    public function update($id, $titulo, $precio, $id_director){
        $data = ['id' => $id, 'titulo' => $titulo, 'precio' => $precio, 'id_director' => $id_director];
        $dataSaneados = Validator::sanear($data);
        $errors = Validator::validarPelicula($dataSaneados);

        if(!empty($errors)){
            $errores = new ValidatorException($errors);
            return $errores->getErrors();
        }
        $tituloSaneado = $dataSaneados['titulo'];
        $precioSaneado = $dataSaneados['precio'];
        $id_directorSaneado = $dataSaneados['id_director'];
        $idSaneado = $dataSaneados['id'];


        // Verificar si el id_director existe
        $result = $this->db->query("SELECT id FROM director WHERE id = ?", [$id_directorSaneado]);
        if ($result->num_rows == 0) {
            return "El director no existe";
        }

        $this->db->query("UPDATE pelicula SET titulo = ?, precio = ?, id_director = ? WHERE id = ?", [$tituloSaneado, $precioSaneado, $id_directorSaneado, $idSaneado]);
        return $this->db->query("SELECT ROW_COUNT() as affected")->fetch_assoc()['affected'];
    }

    public function delete($id){
        $idSaneado = Validator::sanear([$id]);
        $this->db->query("DELETE FROM pelicula WHERE id = ?", [$idSaneado[0]]);
        return $this->db->query("SELECT ROW_COUNT() as affected")->fetch_assoc()['affected'];
    }
}
