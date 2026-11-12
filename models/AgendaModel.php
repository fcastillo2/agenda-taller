<?php

class AgendaModel
{
    private MySqlConnect $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function obtenerSucursal(int $sucursalId): ?array
    {
        $filas = $this->enlace->executeSQL(
            'SELECT id, nombre FROM sucursal WHERE id = ?',
            [$sucursalId],
            'i'
        );

        return $filas[0] ?? null;
    }

    public function consultar(
        string $tipo,
        int $sucursalId,
        ?int $registroId = null
    ): array {
        [$sql, $orden] = match ($tipo) {
            'horario' => [
                'SELECT id, sucursal_id, fecha, hora_inicio, hora_fin
                 FROM horario_sucursal
                 WHERE sucursal_id = ? AND fecha IS NOT NULL',
                'fecha, hora_inicio, id',
            ],
            'bloqueo' => [
                'SELECT id, sucursal_id, inicio, fin, motivo
                 FROM bloqueo_agenda
                 WHERE sucursal_id = ?',
                'inicio, id',
            ],
            default => throw new InvalidArgumentException('Tipo de agenda inválido.'),
        };

        if ($registroId !== null) {
            return $this->enlace->executeSQL(
                $sql . ' AND id = ?',
                [$sucursalId, $registroId],
                'ii'
            );
        }

        return $this->enlace->executeSQL(
            $sql . ' ORDER BY ' . $orden,
            [$sucursalId],
            'i'
        );
    }

    public function crear(
        string $tipo,
        int $sucursalId,
        string $fecha,
        string $horaInicio,
        string $horaFin,
        ?int $creadoPor = null,
        string $motivo = ''
    ): int {
        return $this->enlace->enTransaccion(function () use (
            $tipo,
            $sucursalId,
            $fecha,
            $horaInicio,
            $horaFin,
            $creadoPor,
            $motivo
        ): int {
            $sede = $this->enlace->executeSQL(
                'SELECT id FROM sucursal WHERE id = ? FOR UPDATE',
                [$sucursalId],
                'i'
            );

            if ($sede === []) {
                throw new OutOfBoundsException('Sucursal no encontrada.');
            }

            $inicio = "$fecha $horaInicio:00";
            $fin = "$fecha $horaFin:00";

            $horarios = $this->enlace->executeSQL(
                'SELECT id FROM horario_sucursal
             WHERE sucursal_id = ? AND fecha = ?
               AND hora_inicio < ? AND hora_fin > ?
             LIMIT 1',
                [$sucursalId, $fecha, $horaFin, $horaInicio],
                'isss'
            );

            if ($horarios !== []) {
                throw new DomainException(
                    'El rango se superpone con un horario de esta sucursal.'
                );
            }

            $bloqueos = $this->enlace->executeSQL(
                'SELECT id FROM bloqueo_agenda
             WHERE sucursal_id = ? AND inicio < ? AND fin > ?
             LIMIT 1',
                [$sucursalId, $fin, $inicio],
                'iss'
            );

            if ($bloqueos !== []) {
                throw new DomainException(
                    'El rango se superpone con un bloqueo de esta sucursal.'
                );
            }

            if ($tipo === 'horario') {
                $diaSemana = (int) (new DateTimeImmutable($fecha))->format('N');

                $resultado = $this->enlace->executeWrite(
                    'INSERT INTO horario_sucursal
                    (sucursal_id, fecha, dia_semana, hora_inicio, hora_fin)
                 VALUES (?, ?, ?, ?, ?)',
                    [$sucursalId, $fecha, $diaSemana, $horaInicio, $horaFin],
                    'isiss'
                );
            } else {
                $resultado = $this->enlace->executeWrite(
                    'INSERT INTO bloqueo_agenda
                    (sucursal_id, creado_por_id, inicio, fin, motivo)
                 VALUES (?, ?, ?, ?, ?)',
                    [$sucursalId, $creadoPor, $inicio, $fin, $motivo],
                    'iisss'
                );
            }

            return (int) $resultado['id_insertado'];
        });
    }

    public function disponibilidadSemanal(
        int $sucursalId,
        array $horarios,
        array $bloqueos
    ): array {
        $semanales = $this->enlace->executeSQL(
            'SELECT dia_semana, hora_inicio, hora_fin
         FROM horario_sucursal
         WHERE sucursal_id = ? AND fecha IS NULL
         ORDER BY dia_semana, hora_inicio',
            [$sucursalId],
            'i'
        );

        $porDiaSemana = [];
        foreach ($semanales as $horario) {
            $porDiaSemana[(int) $horario['dia_semana']][] = $horario;
        }

        $porFecha = [];
        foreach ($horarios as $horario) {
            $porFecha[$horario['fecha']][] = $horario;
        }

        $zona = new DateTimeZone('America/Costa_Rica');
        $hoy = new DateTimeImmutable('today', $zona);
        $lunes = $hoy->modify('monday this week');
        $semanas = [[], []];

        for ($i = 0; $i < 14; $i++) {
            $dia = $lunes->modify("+$i days");
            $fecha = $dia->format('Y-m-d');
            $numeroDia = (int) $dia->format('N');

            $base = $porFecha[$fecha] ?? $porDiaSemana[$numeroDia] ?? [];
            $rangos = [];

            foreach ($base as $horario) {
                $rangos[] = [
                    $fecha . ' ' . $horario['hora_inicio'],
                    $fecha . ' ' . $horario['hora_fin'],
                ];
            }

            foreach ($bloqueos as $bloqueo) {
                $restantes = [];

                foreach ($rangos as [$inicio, $fin]) {
                    if ($bloqueo['fin'] <= $inicio || $bloqueo['inicio'] >= $fin) {
                        $restantes[] = [$inicio, $fin];
                        continue;
                    }

                    if ($inicio < $bloqueo['inicio']) {
                        $restantes[] = [$inicio, $bloqueo['inicio']];
                    }

                    if ($bloqueo['fin'] < $fin) {
                        $restantes[] = [$bloqueo['fin'], $fin];
                    }
                }

                $rangos = $restantes;
            }

            $semanas[intdiv($i, 7)][] = [
                'fecha' => $fecha,
                'rangos' => array_map(
                    fn(array $rango): array => [
                        'inicio' => substr($rango[0], 11, 5),
                        'fin' => substr($rango[1], 11, 5),
                    ],
                    $rangos
                ),
            ];
        }

        return $semanas;
    }
}
