<?php

class CitaController
{
    //Variable para simular el id del encargado de la sucursal, en un escenario real este valor vendría de la sesión del usuario logueado.
    //9 = Admin, 10 = Encargado, 13 = Cliente
    private int $encargadoId = 10;

    public function listar(): void
    {
        $modelo = new CitaModel();

        $citas = $modelo->listarPorEncargado(
            $this->encargadoId
        );

        Response::json([
            'cantidad' => count($citas),
            'citas' => $citas,
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

        $modelo = new CitaModel();

        $cita = $modelo->obtenerPorId(
            $id,
            $this->encargadoId
        );

        if ($cita === null) {
            Response::json(
                ['mensaje' => 'Reserva no encontrada para la sucursal.'],
                404
            );

            return;
        }

        Response::json([
            'cita' => $cita,
        ]);
    }
}