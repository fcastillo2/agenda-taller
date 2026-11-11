<?php

class ServicioModel
{
    private MySqlConnect $conexion;

    public function __construct()
    {
        $this->conexion = new MySqlConnect();
    }

    public function listar(): array
    {
        return $this->conexion->executeSQL(
            'SELECT id, nombre, descripcion, precio, duracion_minutos,
                    material_aplicable, equipo_requerido, imagen
             FROM servicio
             ORDER BY nombre, id'
        );
    }

    public function detalle(int $id): ?array
    {
        $filas = $this->conexion->executeSQL(
            'SELECT id, nombre, descripcion, precio, duracion_minutos,
                    material_aplicable, equipo_requerido, imagen
             FROM servicio
             WHERE id = ?',
            [$id],
            'i'
        );

        return $filas[0] ?? null;
    }

    public function crear(array $datos): int
    {
        $resultado = $this->conexion->executeWrite(
            'INSERT INTO servicio
                (nombre, descripcion, precio, duracion_minutos,
                 material_aplicable, equipo_requerido, imagen)
             VALUES (?, ?, ?, ?, ?, ?, ?)',
            $this->valores($datos),
            'sssisss'
        );

        return (int) $resultado['id_insertado'];
    }

    public function actualizar(int $id, array $datos): int
    {
        $valores = $this->valores($datos);
        $valores[] = $id;

        $resultado = $this->conexion->executeWrite(
            'UPDATE servicio
             SET nombre = ?, descripcion = ?, precio = ?,
                 duracion_minutos = ?, material_aplicable = ?,
                 equipo_requerido = ?, imagen = ?
             WHERE id = ?',
            $valores,
            'sssisssi'
        );

        return $resultado['filas_afectadas'];
    }

    private function valores(array $datos): array
    {
        return [
            $datos['nombre'],
            $datos['descripcion'],
            $datos['precio'],
            $datos['duracion_minutos'],
            $datos['material_aplicable'],
            $datos['equipo_requerido'],
            $datos['imagen'],
        ];
    }
}