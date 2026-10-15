<?php

// 1. La respuesta será JSON y admitirá caracteres como tildes.
header('Content-Type: application/json; charset=utf-8');

// 2. Cargar la configuración de la base de datos.
$config = require __DIR__ . '/config/database.php';

try {
    // 3. Construir la dirección de conexión.
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $config['host'],
        $config['port'],
        $config['database']
    );

    // 4. Abrir la conexión con la base de datos.
    $conexion = new PDO(
        $dsn,
        $config['username'],
        $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    // 5. Definir la consulta SQL.
    $sql = '
        SELECT
            p.id,
            p.nombre,
            p.descripcion,
            p.precio,
            p.material,
            p.dimensiones,
            p.imagen,
            c.nombre AS categoria
        FROM producto AS p
        INNER JOIN categoria_producto AS c
            ON c.id = p.categoria_id
        ORDER BY p.nombre
    ';

    // 6. Preparar y ejecutar la consulta.
    $consulta = $conexion->prepare($sql);
    $consulta->execute();

    // 7. Obtener todas las filas.
    $productos = $consulta->fetchAll();

    // 8. Convertir los resultados a JSON y responder.
    echo json_encode(
        [
            'cantidad' => count($productos),
            'productos' => $productos,
        ],
        JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
    );

} catch (Throwable $error) {
    // 9. Registrar el error para poder investigarlo.
    error_log($error->getMessage());

    // 10. Comunicar que la solicitud falló.
    http_response_code(500);

    echo json_encode(
        [
            'mensaje' => 'No se pudo consultar la lista de productos.',
        ],
        JSON_UNESCAPED_UNICODE
    );
}