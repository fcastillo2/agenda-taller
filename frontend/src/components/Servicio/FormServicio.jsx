import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid2";
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import ServicioService from "../../services/ServicioService";

const valoresIniciales = {
  nombre: "",
  descripcion: "",
  precio: "",
  duracion_minutos: "",
  material_aplicable: "",
  equipo_requerido: "",
};

const materiales = [
  "Acero al carbono",
  "Acero inoxidable",
  "Aluminio",
  "Bronce",
  "Plástico",
];

const equipos = [
  "Soldadora",
  "Torno",
  "Fresadora",
  "Taladro de banco",
  "Equipo para soldadura de plástico",
];

const duraciones = [
  { valor: "30", texto: "30 minutos" },
  { valor: "60", texto: "1 hora" },
  { valor: "90", texto: "1 hora y 30 minutos" },
  { valor: "120", texto: "2 horas" },
];

export function FormServicio() {
  const { id } = useParams();
  const navegar = useNavigate();
  const esEdicion = Boolean(id);

  const [datos, setDatos] = useState(valoresIniciales);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(esEdicion);
  const [errorCarga, setErrorCarga] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    const controlador = new AbortController();

    setDatos(valoresIniciales);
    setErrores({});
    setMensaje("");
    setErrorCarga("");
    setCargando(Boolean(id));
    setImagen(null);

    if (!id) {
      return () => controlador.abort();
    }

    ServicioService.getServicioById(id, controlador.signal)
      .then((respuesta) => {
        if (controlador.signal.aborted) return;

        const servicio = respuesta.data;

        setDatos({
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          precio: String(servicio.precio),
          duracion_minutos: String(servicio.duracion_minutos),
          material_aplicable: servicio.material_aplicable,
          equipo_requerido: servicio.equipo_requerido,
        });
      })
      .catch((errorSolicitud) => {
        if (controlador.signal.aborted) return;

        setErrorCarga(
          errorSolicitud.response?.data?.mensaje ??
            "No se pudo cargar el servicio.",
        );
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controlador.abort();
  }, [id]);

  function cambiarCampo(evento) {
    const { name, value } = evento.target;

    setDatos((actuales) => ({
      ...actuales,
      [name]: value,
    }));

    setErrores((actuales) => ({
      ...actuales,
      [name]: "",
    }));
  }

  function validar() {
    const nuevosErrores = {};

    const limites = {
      nombre: 150,
      descripcion: 2000,
    };

    Object.entries(limites).forEach(([campo, maximo]) => {
      const texto = datos[campo].trim();

      if (texto.length === 0 || texto.length > maximo) {
        nuevosErrores[campo] = `Ingresa un texto de 1 a ${maximo} caracteres.`;
      }
    });

    const precio = datos.precio.trim();

    if (!/^[0-9]{1,10}(?:\.[0-9]{1,2})?$/.test(precio) || Number(precio) <= 0) {
      nuevosErrores.precio =
        "Ingresa un precio mayor a cero con hasta dos decimales.";
    }

    if (!materiales.includes(datos.material_aplicable)) {
      nuevosErrores.material_aplicable = "Selecciona un material de la lista.";
    }

    if (!equipos.includes(datos.equipo_requerido)) {
      nuevosErrores.equipo_requerido = "Selecciona un equipo de la lista.";
    }

    if (
      !duraciones.some((duracion) => duracion.valor === datos.duracion_minutos)
    ) {
      nuevosErrores.duracion_minutos =
        "Selecciona una duración de 30, 60, 90 o 120 minutos.";
    }

    return nuevosErrores;
  }

  async function guardar(evento) {
    evento.preventDefault();

    if (guardando) return;

    setMensaje("");

    const nuevosErrores = validar();
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      setMensaje("Revisa los campos señalados.");
      return;
    }

    const envio = {
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      precio: datos.precio.trim(),
      duracion_minutos: Number(datos.duracion_minutos),
      material_aplicable: datos.material_aplicable.trim(),
      equipo_requerido: datos.equipo_requerido.trim(),
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
        ? await ServicioService.actualizarServicio(id, envio)
        : await ServicioService.crearServicio(envio);

      navegar(`/servicio/${respuesta.data.id}`);
    } catch (errorSolicitud) {
      setMensaje(
        errorSolicitud.response?.data?.mensaje ??
          "No se pudo guardar el servicio.",
      );

      setErrores(errorSolicitud.response?.data?.errores ?? {});
    } finally {
      setGuardando(false);
    }
  }

  const rutaVolver = esEdicion ? `/servicio/${id}` : "/servicio";

  if (cargando) {
    return (
      <Typography role="status" sx={{ p: 3 }}>
        Cargando formulario...
      </Typography>
    );
  }

  if (errorCarga) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{errorCarga}</Alert>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button component={Link} to="/servicio" variant="outlined">
            Volver a servicios
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          {esEdicion ? "Editar servicio" : "Crear servicio"}
        </Typography>

        {mensaje && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {mensaje}
          </Alert>
        )}

        <Box component="form" onSubmit={guardar} noValidate>
          <Box
            component="fieldset"
            disabled={guardando}
            sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
          >
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  label="Nombre"
                  name="nombre"
                  value={datos.nombre}
                  onChange={cambiarCampo}
                  error={Boolean(errores.nombre)}
                  helperText={errores.nombre}
                  required
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Precio en colones"
                  name="precio"
                  value={datos.precio}
                  onChange={cambiarCampo}
                  error={Boolean(errores.precio)}
                  helperText={
                    errores.precio ?? "Sin separadores de miles. Ejemplo: 15000"
                  }
                  required
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Duración"
                  name="duracion_minutos"
                  value={datos.duracion_minutos}
                  onChange={cambiarCampo}
                  error={Boolean(errores.duracion_minutos)}
                  helperText={errores.duracion_minutos}
                  required
                  fullWidth
                >
                  <MenuItem value="" disabled>
                    Selecciona una duración
                  </MenuItem>

                  {duraciones.map((duracion) => (
                    <MenuItem key={duracion.valor} value={duracion.valor}>
                      {duracion.texto}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Material aplicable"
                  name="material_aplicable"
                  value={datos.material_aplicable}
                  onChange={cambiarCampo}
                  error={Boolean(errores.material_aplicable)}
                  helperText={errores.material_aplicable}
                  required
                  fullWidth
                >
                  <MenuItem value="" disabled>
                    Selecciona un material
                  </MenuItem>

                  {materiales.map((material) => (
                    <MenuItem key={material} value={material}>
                      {material}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Equipo requerido"
                  name="equipo_requerido"
                  value={datos.equipo_requerido}
                  onChange={cambiarCampo}
                  error={Boolean(errores.equipo_requerido)}
                  helperText={errores.equipo_requerido}
                  required
                  fullWidth
                >
                  <MenuItem value="" disabled>
                    Selecciona un equipo
                  </MenuItem>

                  {equipos.map((equipo) => (
                    <MenuItem key={equipo} value={equipo}>
                      {equipo}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Descripción"
                  name="descripcion"
                  value={datos.descripcion}
                  onChange={cambiarCampo}
                  error={Boolean(errores.descripcion)}
                  helperText={errores.descripcion}
                  multiline
                  minRows={3}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid size={12}>
              <Box component="label" sx={{ display: "grid", gap: 1 }}>
                Fotografía del servicio
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
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

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
                flexWrap: "wrap",
              }}
            >
              <Button
                component={Link}
                to={rutaVolver}
                variant="outlined"
                disabled={guardando}
              >
                Cancelar
              </Button>

              <Button type="submit" variant="contained" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar servicio"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
