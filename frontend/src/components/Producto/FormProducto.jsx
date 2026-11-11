import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid2";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ProductoService from "../../services/ProductoService";

const inicial = {
  categoria_id: "",
  nombre: "",
  descripcion: "",
  precio: "",
  material: "",
  dimensiones: "",
};

const campos = [
  { nombre: "nombre", etiqueta: "Nombre", ancho: 12 },
  { nombre: "precio", etiqueta: "Precio en colones", ancho: 6 },
  { nombre: "material", etiqueta: "Material", ancho: 6 },
  { nombre: "dimensiones", etiqueta: "Dimensiones", ancho: 6 },
  { nombre: "descripcion", etiqueta: "Descripción", ancho: 12 },
];

export function FormProducto() {
  const { id } = useParams();
  const navegar = useNavigate();
  const esEdicion = Boolean(id);
  const rutaVolver = esEdicion ? `/producto/${id}` : "/producto";

  const [datos, setDatos] = useState(inicial);
  const [categorias, setCategorias] = useState([]);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [errorCarga, setErrorCarga] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    const controlador = new AbortController();
    const { signal } = controlador;

    setCargando(true);
    setErrorCarga("");
    setMensaje("");
    setErrores({});
    setDatos(inicial);
    setImagen(null);

    async function cargar() {
      try {
        const [respuestaCategorias, respuestaProducto] = await Promise.all([
          ProductoService.getCategorias(signal),
          id ? ProductoService.getProductoById(id, signal) : null,
        ]);

        if (signal.aborted) return;

        setCategorias(respuestaCategorias.data.categorias);

        if (respuestaProducto) {
          const producto = respuestaProducto.data.producto;

          setDatos({
            categoria_id: String(producto.categoria_id),
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: String(producto.precio),
            material: producto.material,
            dimensiones: producto.dimensiones,
          });
        }
      } catch (error) {
        if (signal.aborted) return;

        setErrorCarga(
          error.response?.data?.mensaje ??
            "No se pudo cargar el formulario de productos.",
        );
      } finally {
        if (!signal.aborted) setCargando(false);
      }
    }

    cargar();
    return () => controlador.abort();
  }, [id]);

  function cambiarCampo(evento) {
    const { name, value } = evento.target;
    setDatos((actuales) => ({ ...actuales, [name]: value }));
    setErrores((actuales) => ({ ...actuales, [name]: "" }));
  }

  async function guardar(evento) {
    evento.preventDefault();
    if (guardando) return;

    setMensaje("");
    setErrores({});

    const envio = {
      categoria_id: Number(datos.categoria_id),
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      precio: datos.precio.trim(),
      material: datos.material.trim(),
      dimensiones: datos.dimensiones.trim(),
    };

    let cuerpo = envio;

    if (imagen) {
      cuerpo = new FormData();
      cuerpo.append("datos", JSON.stringify(envio));
      cuerpo.append("imagen", imagen);
    }

    setGuardando(true);

    try {
      const respuesta = esEdicion
        ? await ProductoService.actualizarProducto(id, cuerpo)
        : await ProductoService.crearProducto(cuerpo);

      navegar(`/producto/${respuesta.data.producto.id}`);
    } catch (error) {
      setMensaje(
        error.response?.data?.mensaje ?? "No se pudo guardar el producto.",
      );
      setErrores(error.response?.data?.errores ?? {});
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <Typography role="status" sx={{ p: 3 }}>
        Cargando...
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          {esEdicion ? "Editar producto" : "Crear producto"}
        </Typography>

        {errorCarga ? (
          <>
            <Alert severity="error">{errorCarga}</Alert>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button component={Link} to="/producto" variant="outlined">
                Volver a productos
              </Button>
            </Box>
          </>
        ) : (
          <Box component="form" onSubmit={guardar} noValidate>
            {mensaje && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {mensaje}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Categoría"
                  name="categoria_id"
                  value={datos.categoria_id}
                  onChange={cambiarCampo}
                  error={Boolean(errores.categoria_id)}
                  helperText={errores.categoria_id}
                  disabled={guardando}
                  required
                  fullWidth
                >
                  <MenuItem value="" disabled>
                    Selecciona una categoría
                  </MenuItem>
                  {categorias.map((categoria) => (
                    <MenuItem key={categoria.id} value={String(categoria.id)}>
                      {categoria.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {campos.map(({ nombre, etiqueta, ancho }) => (
                <Grid key={nombre} size={{ xs: 12, sm: ancho }}>
                  <TextField
                    label={etiqueta}
                    name={nombre}
                    value={datos[nombre]}
                    onChange={cambiarCampo}
                    error={Boolean(errores[nombre])}
                    helperText={
                      errores[nombre] ||
                      (nombre === "precio"
                        ? "Sin separadores de miles. Ej.: 12000"
                        : "")
                    }
                    multiline={nombre === "descripcion"}
                    minRows={nombre === "descripcion" ? 3 : undefined}
                    disabled={guardando}
                    required
                    fullWidth
                  />
                </Grid>
              ))}

              <Grid size={12}>
                <Box component="label" sx={{ display: "grid", gap: 1 }}>
                  Fotografía del producto
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={guardando}
                    onChange={(evento) => {
                      setImagen(evento.target.files?.[0] ?? null);
                      setErrores((actuales) => ({ ...actuales, imagen: "" }));
                    }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  color={errores.imagen ? "error" : "text.secondary"}
                  sx={{ mt: 1 }}
                >
                  {errores.imagen ||
                    (esEdicion
                      ? "Selecciona un archivo solo si deseas reemplazar la foto actual."
                      : "Formatos JPG, PNG o WebP. Máximo 2 MB.")}
                </Typography>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
                flexWrap: "wrap",
              }}
            >
              <Button component={Link} to={rutaVolver} variant="outlined">
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar producto"}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
