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

        $segmentos = $ruta === ''
            ? []
            : explode('/', $ruta);

        if (
            ($segmentos[0] ?? null) === 'servicio' &&
            count($segmentos) <= 2
        ) {
            $metodo = $_SERVER['REQUEST_METHOD'];
            $id = $segmentos[1] ?? null;
            $permitidos = $id === null
                ? ['GET', 'POST']
                : ['GET', 'PUT', 'POST'];

            if (!in_array($metodo, $permitidos, true)) {
                header('Allow: ' . implode(', ', $permitidos));
                Response::json(['mensaje' => 'Método no permitido.'], 405);
                return;
            }

            $controlador = new ServicioController();

            if ($metodo === 'POST' && $id === null) {
                $controlador->crear();
            } elseif ($metodo === 'PUT' || $metodo === 'POST') {
                $controlador->actualizar($id);
            } elseif ($id === null) {
                $controlador->listar();
            } else {
                $controlador->detalle($id);
            }

            return;
        }


        $esProducto =
            count($segmentos) >= 1 &&
            count($segmentos) <= 2 &&
            $segmentos[0] === 'producto';

        $esFactura =
            count($segmentos) >= 1 &&
            count($segmentos) <= 2 &&
            $segmentos[0] === 'factura';

        $esCita =
            count($segmentos) >= 1 &&
            count($segmentos) <= 2 &&
            $segmentos[0] === 'cita';

        if ($esProducto) {
            $metodo = $_SERVER['REQUEST_METHOD'];
            $id = $segmentos[1] ?? null;

            if ($metodo === 'POST' && $id === null) {
                (new ProductoController())->guardar();
                return;
            }

            if (
                in_array($metodo, ['PUT', 'POST'], true) &&
                $id !== null &&
                $id !== 'categorias'
            ) {
                (new ProductoController())->guardar($id);
                return;
            }
        }

        if (!$esProducto && !$esFactura && !$esCita) {
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

        if ($esProducto) {
            $controlador = new ProductoController();

            if (($segmentos[1] ?? null) === 'categorias') {
                $controlador->categorias();
                return;
            }

            if (count($segmentos) === 1) {
                $controlador->listar();
            } else {
                $controlador->detalle($segmentos[1]);
            }

            return;
        }

        if ($esFactura) {
            $controlador = new FacturaController();

            if (count($segmentos) === 1) {
                $controlador->listar();
            } else {
                $controlador->detalle($segmentos[1]);
            }
        }

        if ($esCita) {
            $controlador = new CitaController();

            if (count($segmentos) === 1) {
                $controlador->listar();
            } else {
                $controlador->detalle($segmentos[1]);
            }
        }
    }
}
