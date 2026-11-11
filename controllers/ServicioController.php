<?php

class ServicioController
{
    private ServicioModel $modelo;

    public function __construct()
    {
        $this->modelo = new ServicioModel();
    }

    public function listar(): void
    {
        Response::json($this->modelo->listar(), 200);
    }

    public function detalle(string $id): void
    {
        $id = $this->validarId($id);

        if ($id === null) {
            return;
        }

        $servicio = $this->modelo->detalle($id);

        if ($servicio === null) {
            Response::json(['mensaje' => 'Servicio no encontrado.'], 404);
            return;
        }

        Response::json($servicio, 200);
    }

    public function crear(): void
    {
        $datos = $this->leerDatos();

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


        $id = $this->modelo->crear($datos);

        Response::json($this->modelo->detalle($id), 201);
    }

    public function actualizar(string $id): void
    {
        $id = $this->validarId($id);

        if ($id === null) {
            return;
        }

        $servicio = $this->modelo->detalle($id);

        if ($servicio === null) {
            Response::json(['mensaje' => 'Servicio no encontrado.'], 404);
            return;
        }

        $datos = $this->leerDatos();

        if ($datos === null) {
            return;
        }

        $datos['imagen'] = $this->guardarImagen($servicio['imagen']);
        $this->modelo->actualizar($id, $datos);

        Response::json($this->modelo->detalle($id), 200);
    }

    private function validarId(string $id): ?int
    {
        $numero = filter_var($id, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        if ($numero === false) {
            Response::json(['mensaje' => 'El ID debe ser un entero positivo.'], 400);
            return null;
        }

        return $numero;
    }

    private function leerDatos(): ?array
    {
        $esFormulario = str_starts_with(
            $_SERVER['CONTENT_TYPE'] ?? '',
            'multipart/form-data'
        );

        $entrada = json_decode(
            $esFormulario
                ? ($_POST['datos'] ?? 'null')
                : file_get_contents('php://input')
        );

        $datos = [];
        $errores = [];

        $limites = [
            'nombre' => 150,
            'descripcion' => 2000,
        ];

        foreach ($limites as $campo => $maximo) {
            $valor = $entrada->$campo ?? null;
            $texto = is_string($valor) ? trim($valor) : '';

            if ($texto === '' || mb_strlen($texto, 'UTF-8') > $maximo) {
                $errores[$campo] = "Ingresa un texto de 1 a {$maximo} caracteres.";
                continue;
            }

            $datos[$campo] = $texto;
        }

        $materiales = [
            'Acero al carbono',
            'Acero inoxidable',
            'Aluminio',
            'Bronce',
            'Plástico',
        ];

        $equipos = [
            'Soldadora',
            'Torno',
            'Fresadora',
            'Taladro de banco',
            'Equipo para soldadura de plástico',
        ];

        $material = $entrada->material_aplicable ?? null;

        if (!in_array($material, $materiales, true)) {
            $errores['material_aplicable'] =
                'Selecciona un material de la lista.';
        } else {
            $datos['material_aplicable'] = $material;
        }

        $equipo = $entrada->equipo_requerido ?? null;

        if (!in_array($equipo, $equipos, true)) {
            $errores['equipo_requerido'] =
                'Selecciona un equipo de la lista.';
        } else {
            $datos['equipo_requerido'] = $equipo;
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

        $duracion = $entrada->duracion_minutos ?? null;

        if (!in_array($duracion, [30, 60, 90, 120], true)) {
            $errores['duracion_minutos'] =
                'Selecciona una duración de 30, 60, 90 o 120 minutos.';
        } else {
            $datos['duracion_minutos'] = $duracion;
        }

        if ($errores !== []) {
            Response::json([
                'mensaje' => 'Revisa los campos del servicio.',
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
        $carpeta = dirname(__DIR__) . '/uploads/servicios';

        if (!move_uploaded_file($archivo['tmp_name'], $carpeta . '/' . $nombre)) {
            throw new RuntimeException('No se pudo guardar la imagen.');
        }

        return '/api/uploads/servicios/' . $nombre;
    }
}
