<?php

class CitaModel
{
    private MySqlConnect $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function listarPorEncargado(int $encargadoId): array
    {
        $sql = "
            SELECT
                c.id,
                c.inicio,
                c.fin,
                cliente.nombre AS cliente,
                servicio.nombre AS servicio,
                estado.nombre AS estado,
                estado.color AS estado_color

            FROM cita AS c

            INNER JOIN usuario AS cliente
                ON cliente.id = c.cliente_id

            INNER JOIN servicio
                ON servicio.id = c.servicio_id

            INNER JOIN estado_cita AS estado
                ON estado.id = c.estado_id

            INNER JOIN usuario AS encargado
                ON encargado.sucursal_id = c.sucursal_id

            INNER JOIN rol AS r
                ON r.id = encargado.rol_id

            WHERE encargado.id = ?
              AND r.nombre = 'Encargado'

            ORDER BY c.inicio DESC, c.id DESC
        ";

        return $this->enlace->executeSQL(
            $sql,
            [$encargadoId],
            'i'
        );
    }

    public function obtenerPorId(
        int $citaId,
        int $encargadoId
    ): ?array {
        $sql = "
        SELECT
            c.id,
            c.fecha_creacion,
            c.inicio,
            c.fin,

            cliente.identificacion AS cliente_identificacion,
            cliente.nombre AS cliente_nombre,

            sucursal.nombre AS sucursal_nombre,
            servicio.nombre AS servicio_nombre,

            estado.nombre AS estado,
            estado.color AS estado_color,

            c.descripcion_trabajo,
            c.material_pieza,
            c.uso_pieza

        FROM cita AS c

        INNER JOIN usuario AS cliente
            ON cliente.id = c.cliente_id

        INNER JOIN sucursal
            ON sucursal.id = c.sucursal_id

        INNER JOIN servicio
            ON servicio.id = c.servicio_id

        INNER JOIN estado_cita AS estado
            ON estado.id = c.estado_id

        INNER JOIN usuario AS encargado
            ON encargado.sucursal_id = c.sucursal_id

        INNER JOIN rol AS r
            ON r.id = encargado.rol_id

        WHERE c.id = ?
          AND encargado.id = ?
          AND r.nombre = 'Encargado'
    ";

        $filas = $this->enlace->executeSQL(
            $sql,
            [$citaId, $encargadoId],
            'ii'
        );

        return $filas[0] ?? null;
    }
}
