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

        if (($segmentos[0] ?? null) === 'agenda') {
            $cantidad = count($segmentos);

            if (
                $cantidad === 3 &&
                in_array($segmentos[2], ['horario', 'bloqueo'], true)
            ) {
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    header('Allow: POST');
                    Response::json(['mensaje' => 'Método no permitido.'], 405);
                    return;
                }

                (new AgendaController())->crear($segmentos[1], $segmentos[2]);
                return;
            }

            $esListado = $cantidad === 2;
            $esDetalle = $cantidad === 4
                && in_array($segmentos[2], ['horario', 'bloqueo'], true);

            if (!$esListado && !$esDetalle) {
                Response::json(['mensaje' => 'Ruta de agenda no encontrada.'], 404);
                return;
            }

            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                header('Allow: GET');
                Response::json(['mensaje' => 'Método no permitido.'], 405);
                return;
            }

            (new AgendaController())->consultar(
                $segmentos[1],
                $segmentos[2] ?? null,
                $segmentos[3] ?? null
            );
            return;
        }

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

        if (
            ($segmentos[0] ?? null) === 'sucursal' &&
            ($segmentos[1] ?? null) === 'encargados-disponibles' &&
            count($segmentos) <= 3
        ) {
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                header('Allow: GET');
                Response::json(['mensaje' => 'Método no permitido.'], 405);
                return;
            }

            (new SucursalController())->encargadosDisponibles($segmentos[2] ?? null);
            return;
        }

        if (
            ($segmentos[0] ?? null) === 'sucursal' &&
            count($segmentos) <= 2
        ) {
            $metodo = $_SERVER['REQUEST_METHOD'];
            $id = $segmentos[1] ?? null;
            $permitidos = $id === null ? ['GET', 'POST'] : ['GET', 'PUT'];

            if (!in_array($metodo, $permitidos, true)) {
                header('Allow: ' . implode(', ', $permitidos));
                Response::json(['mensaje' => 'Método no permitido.'], 405);
                return;
            }

            $controlador = new SucursalController();

            if ($metodo === 'POST') {
                $controlador->guardar();
            } elseif ($metodo === 'PUT') {
                $controlador->guardar($id);
            } elseif ($id === null) {
                $controlador->listar();
            } else {
                $controlador->detalle($id);
            }

            return;
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
