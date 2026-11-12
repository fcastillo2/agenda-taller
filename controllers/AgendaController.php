<?php

class AgendaController
{
    public function consultar(
        string $sucursal,
        ?string $tipo = null,
        ?string $registro = null
    ): void {
        $opciones = ['options' => ['min_range' => 1]];
        $sucursalId = filter_var($sucursal, FILTER_VALIDATE_INT, $opciones);
        $registroId = $registro === null
            ? null
            : filter_var($registro, FILTER_VALIDATE_INT, $opciones);

        if ($sucursalId === false || $registroId === false) {
            Response::json(['mensaje' => 'Los IDs deben ser enteros positivos.'], 400);
            return;
        }

        $modelo = new AgendaModel();
        $sede = $modelo->obtenerSucursal($sucursalId);

        if ($sede === null) {
            Response::json(['mensaje' => 'Sucursal no encontrada.'], 404);
            return;
        }

        if ($tipo === null) {
            $horarios = $modelo->consultar('horario', $sucursalId);
            $bloqueos = $modelo->consultar('bloqueo', $sucursalId);

            Response::json([
                'sucursal' => $sede,
                'horarios' => $horarios,
                'bloqueos' => $bloqueos,
                'semanas' => $modelo->disponibilidadSemanal(
                    $sucursalId,
                    $horarios,
                    $bloqueos
                ),
            ]);
            return;
        }
        $filas = $modelo->consultar($tipo, $sucursalId, $registroId);

        if ($filas === []) {
            Response::json(['mensaje' => 'Registro no encontrado en esta sucursal.'], 404);
            return;
        }

        Response::json([
            'sucursal' => $sede,
            $tipo => $filas[0],
        ]);
    }



    public function crear(string $sucursal, string $tipo): void
    {
        $sucursalId = filter_var($sucursal, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        if ($sucursalId === false) {
            Response::json(['mensaje' => 'El ID de la sucursal no es válido.'], 400);
            return;
        }

        $entrada = json_decode(file_get_contents('php://input'));

        if (!$entrada instanceof stdClass) {
            Response::json(['mensaje' => 'Se esperaba un objeto JSON.'], 400);
            return;
        }

        $fecha = $entrada->fecha ?? null;
        $inicio = $entrada->hora_inicio ?? null;
        $fin = $entrada->hora_fin ?? null;
        $motivo = $entrada->motivo ?? '';
        $errores = [];
        $zona = new DateTimeZone('America/Costa_Rica');
        $hoy = new DateTimeImmutable('today', $zona);

        $dia = is_string($fecha) && preg_match('/\A\d{4}-\d{2}-\d{2}\z/', $fecha)
            ? DateTimeImmutable::createFromFormat('!Y-m-d', $fecha, $zona)
            : false;

        if (!$dia || $dia->format('Y-m-d') !== $fecha) {
            $errores['fecha'] = 'Selecciona una fecha válida.';
        } elseif ($dia < $hoy) {
            $errores['fecha'] = 'La fecha no puede ser anterior a hoy.';
        }

        $patronHora = '/\A(?:[01]\d|2[0-3]):[0-5]\d\z/';

        if (!is_string($inicio) || !preg_match($patronHora, $inicio)) {
            $errores['hora_inicio'] = 'Selecciona una hora inicial válida.';
        }

        if (!is_string($fin) || !preg_match($patronHora, $fin)) {
            $errores['hora_fin'] = 'Selecciona una hora final válida.';
        } elseif (!isset($errores['hora_inicio']) && $fin <= $inicio) {
            $errores['hora_fin'] = 'La hora final debe ser posterior a la inicial.';
        }

        if ($tipo === 'bloqueo') {
            $motivo = is_string($motivo) ? trim($motivo) : '';

            if ($motivo === '' || mb_strlen($motivo, 'UTF-8') > 500) {
                $errores['motivo'] = 'Ingresa un motivo de 1 a 500 caracteres.';
            }
        } else {
            $motivo = '';
        }

        if ($errores !== []) {
            Response::json([
                'mensaje' => 'Revisa los campos de la agenda.',
                'errores' => $errores,
            ], 422);
            return;
        }

        $creadoPor = $tipo === 'bloqueo' ? 10 : null;

        $modelo = new AgendaModel();

        try {
            $id = $modelo->crear(
                $tipo,
                $sucursalId,
                $fecha,
                $inicio,
                $fin,
                $creadoPor,
                $motivo
            );
        } catch (OutOfBoundsException $error) {
            Response::json(['mensaje' => $error->getMessage()], 404);
            return;
        } catch (DomainException $error) {
            Response::json(['mensaje' => $error->getMessage()], 409);
            return;
        }

        Response::json([
            $tipo => $modelo->consultar($tipo, $sucursalId, $id)[0],
        ], 201);
    }
}
