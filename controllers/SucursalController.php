<?php

class SucursalController
{
    public function listar(): void
    {
        $modelo = new SucursalModel();

        Response::json([
            'sucursales' => $modelo->listar(),
        ]);
    }

    public function detalle(string $identificador): void
    {
        $id = filter_var($identificador, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        if ($id === false) {
            Response::json(['mensaje' => 'El ID de la sucursal no es válido.'], 400);
            return;
        }

        $sucursal = (new SucursalModel())->obtenerPorId($id);

        if ($sucursal === null) {
            Response::json(['mensaje' => 'Sucursal no encontrada.'], 404);
            return;
        }

        Response::json(['sucursal' => $sucursal]);
    }

    public function encargadosDisponibles(?string $identificador = null): void
    {
        $modelo = new SucursalModel();
        $id = null;

        if ($identificador !== null) {
            $id = filter_var($identificador, FILTER_VALIDATE_INT, [
                'options' => ['min_range' => 1],
            ]);

            if ($id === false) {
                Response::json(['mensaje' => 'El ID de la sucursal no es válido.'], 400);
                return;
            }

            if ($modelo->obtenerPorId($id) === null) {
                Response::json(['mensaje' => 'Sucursal no encontrada.'], 404);
                return;
            }
        }

        Response::json([
            'encargados' => $modelo->listarEncargadosDisponibles($id),
        ]);
    }

    public function guardar(?string $identificador = null): void
    {
        $id = null;

        if ($identificador !== null) {
            $id = filter_var($identificador, FILTER_VALIDATE_INT, [
                'options' => ['min_range' => 1],
            ]);

            if ($id === false) {
                Response::json(['mensaje' => 'El ID de la sucursal no es válido.'], 400);
                return;
            }
        }

        $entrada = json_decode(file_get_contents('php://input'));

        if (!$entrada instanceof stdClass) {
            Response::json(['mensaje' => 'Se esperaba un objeto JSON.'], 400);
            return;
        }

        $datos = [];
        $errores = [];

        $limites = [
            'nombre' => 100,
            'descripcion' => 2000,
            'telefono' => 25,
            'direccion_exacta' => 2000,
            'correo' => 254,
        ];

        foreach ($limites as $campo => $maximo) {
            $valor = $entrada->$campo ?? null;
            $texto = is_string($valor) ? trim($valor) : '';

            if ($texto === '' || mb_strlen($texto, 'UTF-8') > $maximo) {
                $errores[$campo] = "Ingresa un texto de 1 a {$maximo} caracteres.";
            } else {
                $datos[$campo] = $texto;
            }
        }

        if (
            isset($datos['correo']) &&
            !filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)
        ) {
            $errores['correo'] = 'Ingresa un correo electrónico válido.';
        }

        if (
            isset($datos['telefono']) &&
            !preg_match('/\A(?:\+506[ -]?)?[0-9]{4}[ -]?[0-9]{4}\z/', $datos['telefono'])
        ) {
            $errores['telefono'] = 'Ingresa un número de Costa Rica, por ejemplo 2441-1234.';
        }

        $encargadosIds = $entrada->encargados_ids ?? null;

        if (!is_array($encargadosIds)) {
            $errores['encargados_ids'] = 'Envía una lista de encargados.';
        } else {
            foreach ($encargadosIds as $encargadoId) {
                if (!is_int($encargadoId) || $encargadoId < 1) {
                    $errores['encargados_ids'] = 'La lista contiene un ID inválido.';
                    break;
                }
            }
        }

        if ($errores !== []) {
            Response::json([
                'mensaje' => 'Revisa los campos de la sucursal.',
                'errores' => $errores,
            ], 422);
            return;
        }

        $modelo = new SucursalModel();
        $codigo = $id === null ? 201 : 200;

        try {
            $idGuardado = $modelo->guardar($id, $datos, $encargadosIds);
        } catch (OutOfBoundsException $error) {
            Response::json(['mensaje' => $error->getMessage()], 404);
            return;
        } catch (DomainException $error) {
            Response::json([
                'mensaje' => 'No se pudo guardar la asignación.',
                'errores' => ['encargados_ids' => $error->getMessage()],
            ], 409);
            return;
        }

        Response::json([
            'sucursal' => $modelo->obtenerPorId($idGuardado),
        ], $codigo);
    }
}
