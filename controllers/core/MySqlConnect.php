<?php

class MySqlConnect
{
    private mysqli $link;

    public function __construct()
    {
        // Convertir los errores de mysqli en excepciones.
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        // Abrir la conexión.
        $this->link = new mysqli(
            Config::get('host'),
            Config::get('username'),
            Config::get('password'),
            Config::get('database'),
            Config::get('port')
        );

        // Utilizar una codificación que admita tildes y otros caracteres.
        $this->link->set_charset('utf8mb4');
    }

    public function executeSQL(
        string $sql,
        array $parametros = [],
        string $tipos = ''
    ): array {
        // Preparar la consulta.
        $sentencia = $this->link->prepare($sql);

        // Asociar parámetros cuando la consulta los necesita.
        if ($parametros !== []) {
            $sentencia->bind_param($tipos, ...$parametros);
        }

        // Ejecutar y recuperar las filas.
        $sentencia->execute();

        $resultado = $sentencia->get_result();
        $filas = $resultado->fetch_all(MYSQLI_ASSOC);

        // Liberar los recursos de esta consulta.
        $resultado->free();
        $sentencia->close();

        return $filas;
    }
}