<?php

require_once __DIR__ . '/controllers/core/Response.php';

try {
    // Cargar las clases necesarias.
    require_once __DIR__ . '/controllers/core/Config.php';
    require_once __DIR__ . '/controllers/core/MySqlConnect.php';

    require_once __DIR__ . '/models/ProductoModel.php';
    require_once __DIR__ . '/controllers/ProductoController.php';

    require_once __DIR__ . '/routes/RoutesController.php';

    // Procesar la ruta solicitada.
    $rutas = new RoutesController();
    $rutas->ejecutar();

} catch (Throwable $error) {
    error_log($error->getMessage());

    Response::json(
        ['mensaje' => 'No se pudo procesar la solicitud.'],
        500
    );
}