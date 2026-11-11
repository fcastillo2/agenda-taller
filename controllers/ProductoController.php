<?php

class ProductoController
{
    public function listar(): void
    {
        $modelo = new ProductoModel();
        $productos = $modelo->listar();

        Response::json([
            'cantidad' => count($productos),
            'productos' => $productos,
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

        $modelo = new ProductoModel();
        $producto = $modelo->obtenerPorId($id);

        if ($producto === null) {
            Response::json(
                ['mensaje' => 'Producto no encontrado.'],
                404
            );

            return;
        }

        Response::json([
            'producto' => $producto,
        ]);
    }

    public function categorias(): void
    {
        $modelo = new ProductoModel();

        Response::json([
            'categorias' => $modelo->listarCategorias(),
        ]);
    }

    public function guardar(?string $identificador = null): void
    {
        $id = null;
        $modelo = new ProductoModel();

        if ($identificador !== null) {
            $id = filter_var($identificador, FILTER_VALIDATE_INT, [
                'options' => ['min_range' => 1],
            ]);

            if ($id === false) {
                Response::json(['mensaje' => 'El ID del producto no es válido.'], 400);
                return;
            }

            if ($modelo->obtenerPorId($id) === null) {
                Response::json(['mensaje' => 'Producto no encontrado.'], 404);
                return;
            }
        }

        $datos = $this->leerDatos($modelo);

        if ($datos === null) {
            return;
        }

        try {
            $datos['imagen'] = $this->guardarImagen(null);
        } catch (InvalidArgumentException $error) {
            Response::json([
                'mensaje' => 'Revisa la fotografía.',
                'errores' => ['imagen' => $error->getMessage()],
            ], 422);
            return;
        } catch (RuntimeException $error) {
            Response::json(['mensaje' => $error->getMessage()], 500);
            return;
        }

        $codigo = 200;

        if ($id === null) {
            $id = $modelo->crear($datos);
            $codigo = 201;
        } else {
            $modelo->actualizar($id, $datos);
        }

        Response::json([
            'producto' => $modelo->obtenerPorId($id),
        ], $codigo);
    }

    private function leerDatos(ProductoModel $modelo): ?array
    {
        $esFormulario = str_starts_with(
            $_SERVER['CONTENT_TYPE'] ?? '',
            'multipart/form-data'
        );

        $cuerpo = $esFormulario
            ? ($_POST['datos'] ?? '')
            : file_get_contents('php://input');

        $entrada = is_string($cuerpo) ? json_decode($cuerpo) : null;

        if (!$entrada instanceof stdClass) {
            Response::json(['mensaje' => 'Se esperaba un objeto JSON.'], 400);
            return null;
        }

        $datos = [];
        $errores = [];

        $limites = [
            'nombre' => 150,
            'descripcion' => 2000,
            'material' => 150,
            'dimensiones' => 150,
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

        $categoriaId = $entrada->categoria_id ?? null;

        if (
            !is_int($categoriaId) ||
            $categoriaId < 1 ||
            !$modelo->existeCategoria($categoriaId)
        ) {
            $errores['categoria_id'] = 'Selecciona una categoría registrada.';
        } else {
            $datos['categoria_id'] = $categoriaId;
        }

        $precio = $entrada->precio ?? null;

        if (
            !is_string($precio) ||
            !preg_match('/\A[0-9]{1,10}(?:\.[0-9]{1,2})?\z/', $precio) ||
            !preg_match('/[1-9]/', $precio)
        ) {
            $errores['precio'] = 'Ingresa un precio mayor a cero con hasta dos decimales.';
        } else {
            $datos['precio'] = $precio;
        }

        if ($errores !== []) {
            Response::json([
                'mensaje' => 'Revisa los campos del producto.',
                'errores' => $errores,
            ], 422);
            return null;
        }

        return $datos;
    }

    private function guardarImagen(?string $imagenActual): ?string
    {
        $archivo = $_FILES['imagen'] ?? null;

        if ($archivo === null || $archivo['error'] === UPLOAD_ERR_NO_FILE) {
            return $imagenActual;
        }

        if (
            $archivo['error'] !== UPLOAD_ERR_OK ||
            $archivo['size'] === 0 ||
            $archivo['size'] > 2 * 1024 * 1024
        ) {
            throw new InvalidArgumentException(
                'Selecciona una imagen de hasta 2 MB.'
            );
        }

        $extensiones = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];

        $tipo = (new finfo(FILEINFO_MIME_TYPE))->file($archivo['tmp_name']);

        if (!isset($extensiones[$tipo])) {
            throw new InvalidArgumentException(
                'Selecciona una imagen JPG, PNG o WebP.'
            );
        }

        $nombre = bin2hex(random_bytes(16)) . '.' . $extensiones[$tipo];
        $carpeta = dirname(__DIR__) . '/uploads/productos';

        if (!move_uploaded_file($archivo['tmp_name'], $carpeta . '/' . $nombre)) {
            throw new RuntimeException('No se pudo guardar la imagen.');
        }

        return '/api/uploads/productos/' . $nombre;
    }
}
