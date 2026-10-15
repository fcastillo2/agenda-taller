<?php

class ProductoController
{
    public function listar(): void
    {
        $modelo = new ProductoModel();
        $productos = $modelo->listar();

        Response::json([
            'cantidad' => count($productos),
            'productos' => $productos,
        ]);
    }

    public function detalle(string $identificador): void
    {
        $id = filter_var(
            $identificador,
            FILTER_VALIDATE_INT,
            [
                'options' => [
                    'min_range' => 1,
                ],
            ]
        );

        if ($id === false) {
            Response::json(
                [
                    'mensaje' => 'Debe indicar un identificador entero mayor que cero.',
                ],
                400
            );

            return;
        }

        $modelo = new ProductoModel();
        $producto = $modelo->obtenerPorId($id);

        if ($producto === null) {
            Response::json(
                ['mensaje' => 'Producto no encontrado.'],
                404
            );

            return;
        }

        Response::json([
            'producto' => $producto,
        ]);
    }
}
