<?php

class FacturaModel
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
                f.id,
                f.numero,
                f.fecha,
                cliente.nombre AS cliente,
                f.total
            FROM factura AS f

            INNER JOIN usuario AS cliente
                ON cliente.id = f.cliente_id

            INNER JOIN usuario AS encargado
                ON encargado.sucursal_id = f.sucursal_id

            INNER JOIN rol AS r
                ON r.id = encargado.rol_id

            WHERE encargado.id = ?
              AND r.nombre = 'Encargado'

            ORDER BY f.fecha DESC, f.id DESC
        ";

        return $this->enlace->executeSQL(
            $sql,
            [$encargadoId],
            'i'
        );
    }

    public function obtenerPorId(
        int $facturaId,
        int $encargadoId
    ): ?array {
        // Consultar el encabezado y comprobar la sucursal.
        $sql = "
        SELECT
            f.id,
            f.numero,
            f.fecha,
            f.fecha_completada,
            f.cita_id,
            e.nombre AS estado,

            cliente.identificacion AS cliente_identificacion,
            cliente.nombre AS cliente_nombre,

            s.nombre AS sucursal_nombre,
            s.telefono AS sucursal_telefono,
            s.direccion_exacta AS sucursal_direccion,
            s.correo AS sucursal_correo,

            f.subtotal,
            f.impuesto,
            f.total

        FROM factura AS f

        INNER JOIN estado_factura AS e
            ON e.id = f.estado_id

        INNER JOIN usuario AS cliente
            ON cliente.id = f.cliente_id

        INNER JOIN sucursal AS s
            ON s.id = f.sucursal_id

        INNER JOIN usuario AS encargado
            ON encargado.sucursal_id = f.sucursal_id

        INNER JOIN rol AS r
            ON r.id = encargado.rol_id

        WHERE f.id = ?
          AND encargado.id = ?
          AND r.nombre = 'Encargado'
    ";

        $filas = $this->enlace->executeSQL(
            $sql,
            [$facturaId, $encargadoId],
            'ii'
        );

        $factura = $filas[0] ?? null;

        if ($factura === null) {
            return null;
        }

        // Recuperar las líneas de productos y servicios.
        $sqlDetalles = "
        SELECT
            'Producto' AS tipo,
            producto_id AS elemento_id,
            descripcion,
            cantidad,
            precio_unitario,
            porcentaje_impuesto,
            subtotal,
            impuesto,
            total
        FROM factura_producto
        WHERE factura_id = ?

        UNION ALL

        SELECT
            'Servicio' AS tipo,
            servicio_id AS elemento_id,
            descripcion,
            cantidad,
            precio_unitario,
            porcentaje_impuesto,
            subtotal,
            impuesto,
            total
        FROM factura_servicio
        WHERE factura_id = ?

        ORDER BY tipo, elemento_id
    ";

        $factura['detalles'] = $this->enlace->executeSQL(
            $sqlDetalles,
            [$facturaId, $facturaId],
            'ii'
        );

        return $factura;
    }
}
