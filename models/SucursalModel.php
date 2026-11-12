<?php

class SucursalModel
{
    private MySqlConnect $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function listar(): array
    {
        return $this->enlace->executeSQL(
            'SELECT id, nombre, descripcion, telefono, direccion_exacta, correo
             FROM sucursal
             ORDER BY nombre, id'
        );
    }

    public function obtenerPorId(int $id): ?array
    {
        $filas = $this->enlace->executeSQL(
            'SELECT id, nombre, descripcion, telefono, direccion_exacta, correo
             FROM sucursal
             WHERE id = ?',
            [$id],
            'i'
        );

        if ($filas === []) {
            return null;
        }

        $sucursal = $filas[0];
        $sucursal['encargados'] = $this->enlace->executeSQL(
            'SELECT u.id, u.nombre
             FROM usuario AS u
             INNER JOIN rol AS r ON r.id = u.rol_id
             WHERE u.sucursal_id = ? AND r.nombre = ?
             ORDER BY u.nombre, u.id',
            [$id, 'Encargado'],
            'is'
        );

        return $sucursal;
    }

    public function listarEncargadosDisponibles(?int $sucursalId = null): array
    {
        return $this->enlace->executeSQL(
            'SELECT u.id, u.nombre, u.sucursal_id
         FROM usuario AS u
         INNER JOIN rol AS r ON r.id = u.rol_id
         WHERE r.nombre = ?
           AND (u.sucursal_id IS NULL OR u.sucursal_id = ?)
         ORDER BY u.nombre, u.id',
            ['Encargado', $sucursalId],
            'si'
        );
    }

    public function guardar(?int $id, array $datos, array $encargadosIds): int
    {
        // Cada ID se procesa una vez y en el mismo orden.
        $encargadosIds = array_values(array_unique($encargadosIds));
        sort($encargadosIds, SORT_NUMERIC);

        return $this->enlace->enTransaccion(function () use (
            $id,
            $datos,
            $encargadosIds
        ): int {
            $valores = [
                $datos['nombre'],
                $datos['descripcion'],
                $datos['telefono'],
                $datos['direccion_exacta'],
                $datos['correo'],
            ];

            if ($id === null) {
                $resultado = $this->enlace->executeWrite(
                    'INSERT INTO sucursal
                    (nombre, descripcion, telefono, direccion_exacta, correo)
                 VALUES (?, ?, ?, ?, ?)',
                    $valores,
                    'sssss'
                );

                $id = (int) $resultado['id_insertado'];
                $this->crearHorarioHabitual($id);
            } else {
                $filas = $this->enlace->executeSQL(
                    'SELECT id FROM sucursal WHERE id = ? FOR UPDATE',
                    [$id],
                    'i'
                );

                if ($filas === []) {
                    throw new OutOfBoundsException('Sucursal no encontrada.');
                }

                $valores[] = $id;

                $this->enlace->executeWrite(
                    'UPDATE sucursal
                 SET nombre = ?, descripcion = ?, telefono = ?,
                     direccion_exacta = ?, correo = ?
                 WHERE id = ?',
                    $valores,
                    'sssssi'
                );
            }

            $this->guardarEncargados($id, $encargadosIds);

            return $id;
        });
    }

    private function guardarEncargados(int $sucursalId, array $encargadosIds): void
    {
        foreach ($encargadosIds as $encargadoId) {
            $filas = $this->enlace->executeSQL(
                'SELECT u.sucursal_id, r.nombre AS rol
             FROM usuario AS u
             INNER JOIN rol AS r ON r.id = u.rol_id
             WHERE u.id = ?
             FOR UPDATE',
                [$encargadoId],
                'i'
            );

            $usuario = $filas[0] ?? null;

            if (
                $usuario === null ||
                $usuario['rol'] !== 'Encargado' ||
                (
                    $usuario['sucursal_id'] !== null &&
                    (int) $usuario['sucursal_id'] !== $sucursalId
                )
            ) {
                throw new DomainException(
                    'Uno de los encargados seleccionados ya no está disponible.'
                );
            }
        }

        $this->enlace->executeWrite(
            'UPDATE usuario AS u
         INNER JOIN rol AS r ON r.id = u.rol_id
         SET u.sucursal_id = NULL
         WHERE u.sucursal_id = ? AND r.nombre = ?',
            [$sucursalId, 'Encargado'],
            'is'
        );

        foreach ($encargadosIds as $encargadoId) {
            $this->enlace->executeWrite(
                'UPDATE usuario
             SET sucursal_id = ?
             WHERE id = ?',
                [$sucursalId, $encargadoId],
                'ii'
            );
        }
    }

    private function crearHorarioHabitual(int $sucursalId): void
    {
        $this->enlace->executeWrite(
            "INSERT INTO horario_sucursal
            (sucursal_id, fecha, dia_semana, hora_inicio, hora_fin)
         VALUES
            (?, NULL, 1, '08:00:00', '17:00:00'),
            (?, NULL, 2, '08:00:00', '17:00:00'),
            (?, NULL, 3, '08:00:00', '17:00:00'),
            (?, NULL, 4, '08:00:00', '17:00:00'),
            (?, NULL, 5, '08:00:00', '17:00:00')",
            array_fill(0, 5, $sucursalId),
            'iiiii'
        );
    }
    
}
