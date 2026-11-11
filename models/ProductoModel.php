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
                p.categoria_id,
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

    public function listarCategorias(): array
    {
        return $this->enlace->executeSQL(
            'SELECT id, nombre
         FROM categoria_producto
         ORDER BY nombre, id'
        );
    }

    public function existeCategoria(int $id): bool
    {
        $filas = $this->enlace->executeSQL(
            'SELECT id FROM categoria_producto WHERE id = ?',
            [$id],
            'i'
        );

        return $filas !== [];
    }

    public function crear(array $datos): int
    {
        $resultado = $this->enlace->executeWrite(
            'INSERT INTO producto
    (categoria_id, nombre, descripcion, precio, material, dimensiones, imagen)
VALUES (?, ?, ?, ?, ?, ?, ?)',
            $this->valores($datos),
            'issssss'
        );

        return (int) $resultado['id_insertado'];
    }

    public function actualizar(int $id, array $datos): void
    {
        $valores = $this->valores($datos);
        $valores[] = $id;

        $this->enlace->executeWrite(
            'UPDATE producto
         SET categoria_id = ?, nombre = ?, descripcion = ?,
             precio = ?, material = ?, dimensiones = ?,
             imagen = COALESCE(?, imagen)
         WHERE id = ?',
            $valores,
            'issssssi'
        );
    }

    private function valores(array $datos): array
    {
        return [
            $datos['categoria_id'],
            $datos['nombre'],
            $datos['descripcion'],
            $datos['precio'],
            $datos['material'],
            $datos['dimensiones'],
            $datos['imagen'] ?? null,
        ];
    }
}
