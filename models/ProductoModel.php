<?php

class ProductoModel
{
    private MySqlConnect $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function listar(): array
    {
        $sql = '
            SELECT
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.material,
                p.dimensiones,
                p.imagen,
                c.nombre AS categoria
            FROM producto AS p
            INNER JOIN categoria_producto AS c
                ON c.id = p.categoria_id
            ORDER BY p.nombre
        ';

        return $this->enlace->executeSQL($sql);
    }

    public function obtenerPorId(int $id): ?array
    {
        $sql = '
            SELECT
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.material,
                p.dimensiones,
                p.imagen,
                c.nombre AS categoria
            FROM producto AS p
            INNER JOIN categoria_producto AS c
                ON c.id = p.categoria_id
            WHERE p.id = ?
        ';

        $filas = $this->enlace->executeSQL(
            $sql,
            [$id],
            'i'
        );

        return $filas[0] ?? null;
    }
}