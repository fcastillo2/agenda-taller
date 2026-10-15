<?php

class RoutesController
{
    public function ejecutar(): void
    {
        $url = $_GET['url'] ?? '';

        if (!is_string($url)) {
            Response::json(
                ['mensaje' => 'Ruta inválida.'],
                400
            );

            return;
        }

        $ruta = trim($url, '/');

        $segmentos = $ruta === '' ? [] : explode('/', $ruta);

        if (
            count($segmentos) < 1 ||
            count($segmentos) > 2 ||
            $segmentos[0] !== 'producto'
        ) {
            Response::json(
                ['mensaje' => 'Ruta no encontrada.'],
                404
            );

            return;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            header('Allow: GET');

            Response::json(
                ['mensaje' => 'Método no permitido.'],
                405
            );

            return;
        }

        $controlador = new ProductoController();

        if (count($segmentos) === 1) {
            $controlador->listar();
        } else {
            $controlador->detalle($segmentos[1]);
        }
    }
}