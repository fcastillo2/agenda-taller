<?php

class FacturaController
{
    private int $encargadoId = 10;

    public function listar(): void
    {
        $modelo = new FacturaModel();

        $facturas = $modelo->listarPorEncargado(
            $this->encargadoId
        );

        Response::json([
            'cantidad' => count($facturas),
            'facturas' => $facturas,
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

        $modelo = new FacturaModel();

        $factura = $modelo->obtenerPorId(
            $id,
            $this->encargadoId
        );

        if ($factura === null) {
            Response::json(
                ['mensaje' => 'Factura no encontrada para la sucursal.'],
                404
            );

            return;
        }

        Response::json([
            'factura' => $factura,
        ]);
    }
}